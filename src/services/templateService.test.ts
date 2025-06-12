import { generateMarkdownLinks } from './templateService';
import type { ExtendedSettingsStorage } from './templateService';

describe('generateMarkdownLinks', () => {
  it('should use ticketPrefix as subdomain for all environments', () => {
    const settings = {
      allowManualTicketInput: true,
      ticketPrefix: 'ffmfvk-2822',
      integrateQrImage: false,
      jiraPatterns: [{ enabled: true, pattern: '^https://c24-sach\\.atlassian\\.net/browse/FFMFVK-\\d+(?:[?#]|$)' }],
      language: 'auto',
      markdownTemplate: '',
      prefixes: ['FFMFVK'],
      showAdvancedSettings: true,
      theme: "light" as "light",
      ticketTypes: [],
      urlStructure: ['issuePrefix','-','[0-9]+','.','baseUrl'],
      urls: {
        bo: 'bo.r.f1-int.de',
        desktop: '4.d.4-int.de',
        drupal7: 'cms1.sach.vv.check24-int.de/fahrradversicherung',
        drupal9: 'cms2.sach.vv.check24-int.de/fahrradversicherung',
        mobile: 'm.1.4-int.de'
      },
      useMarkdownCopy: true
    } as ExtendedSettingsStorage;
    const markdown = generateMarkdownLinks(settings.urls, undefined, undefined, settings, settings.urlStructure);
    expect(markdown).toContain('https://ffmfvk-2822.bo.r.f1-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.m.1.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.4.d.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung');
    expect(markdown).toContain('https://ffmfvk-2822.cms2.sach.vv.check24-int.de/fahrradversicherung');
  });

  it('should use ticketPrefix as fallback if drupal7Prefix is present in legacy settings', () => {
    const jiraUrlWizardSettings = {
      allowManualTicketInput: true,
      integrateQrImage: false,
      jiraPatterns: [{ enabled: true, pattern: '^https://c24-sach\\.atlassian\\.net/browse/FFMFVK-\\d+(?:[?#]|$)' }],
      language: 'auto',
      markdownTemplate: '',
      prefixes: ['FFMFVK'],
      showAdvancedSettings: true,
      theme: "light" as "light",
      ticketPrefix: 'ffmfvk-2822', // simulate migration from drupal7Prefix
      ticketTypes: [],
      urlStructure: ['issuePrefix','-','[0-9]+','.','baseUrl'],
      urls: {
        bo: 'bo.r.f1-int.de',
        desktop: '4.d.4-int.de',
        drupal7: 'cms1.sach.vv.check24-int.de/fahrradversicherung',
        drupal9: 'cms2.sach.vv.check24-int.de/fahrradversicherung',
        mobile: 'm.1.4-int.de'
      },
      useMarkdownCopy: true
    } as ExtendedSettingsStorage;
    const markdown = generateMarkdownLinks(jiraUrlWizardSettings.urls, undefined, undefined, jiraUrlWizardSettings, jiraUrlWizardSettings.urlStructure);
    expect(markdown).toContain('https://ffmfvk-2822.bo.r.f1-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.m.1.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.4.d.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung');
    expect(markdown).toContain('https://ffmfvk-2822.cms2.sach.vv.check24-int.de/fahrradversicherung');
  });

  it('should copy the correct markdown data to clipboard and log it', async () => {
    let copiedText = '';
    // @ts-ignore
    global.navigator = {
      clipboard: {
        writeText: (text: string) => {
          copiedText = text;
          return Promise.resolve();
        }
      }
    } as any;
    const settings = {
      allowManualTicketInput: true,
      ticketPrefix: 'ffmfvk-2822',
      integrateQrImage: false,
      jiraPatterns: [{ enabled: true, pattern: '^https://c24-sach\\.atlassian\\.net/browse/FFMFVK-\\d+(?:[?#]|$)' }],
      language: 'auto',
      markdownTemplate: '',
      prefixes: ['FFMFVK'],
      showAdvancedSettings: true,
      theme: "light" as "light",
      ticketTypes: [],
      urlStructure: ['issuePrefix','-','[0-9]+','.','baseUrl'],
      urls: {
        bo: 'bo.r.f1-int.de',
        desktop: '4.d.4-int.de',
        drupal7: 'cms1.sach.vv.check24-int.de/fahrradversicherung',
        drupal9: 'cms2.sach.vv.check24-int.de/fahrradversicherung',
        mobile: 'm.1.4-int.de'
      },
      useMarkdownCopy: true
    } as ExtendedSettingsStorage;
    const markdown = generateMarkdownLinks(settings.urls, undefined, undefined, settings, settings.urlStructure);
    await navigator.clipboard.writeText(markdown);
    // Log the copied data for visual inspection
    console.log('Copied Markdown:\n', copiedText);
    expect(copiedText).toContain('https://ffmfvk-2822.bo.r.f1-int.de');
    expect(copiedText).toContain('https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung');
  });

  it('should use prefixes[0] as fallback if ticketPrefix is missing', () => {
    const settings = {
      allowManualTicketInput: true,
      ticketPrefix: '',
      integrateQrImage: false,
      jiraPatterns: [{ enabled: true, pattern: '^https://c24-sach\\.atlassian\\.net/browse/FFMFVK-\\d+(?:[?#]|$)' }],
      language: 'auto',
      markdownTemplate: '',
      prefixes: ['FFMFVK-2822'],
      showAdvancedSettings: true,
      theme: "light" as "light",
      ticketTypes: [],
      urlStructure: ['issuePrefix','-','[0-9]+','.','baseUrl'],
      urls: {
        bo: 'bo.r.f1-int.de',
        desktop: '4.d.4-int.de',
        drupal7: 'cms1.sach.vv.check24-int.de/fahrradversicherung',
        drupal9: 'cms2.sach.vv.check24-int.de/fahrradversicherung',
        mobile: 'm.1.4-int.de'
      },
      useMarkdownCopy: true
    } as ExtendedSettingsStorage;
    const markdown = generateMarkdownLinks(settings.urls, undefined, undefined, settings, settings.urlStructure);
    expect(markdown).toContain('https://ffmfvk-2822.bo.r.f1-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.m.1.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.4.d.4-int.de');
    expect(markdown).toContain('https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung');
    expect(markdown).toContain('https://ffmfvk-2822.cms2.sach.vv.check24-int.de/fahrradversicherung');
  });
}); 