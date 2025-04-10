import type { SettingsStorage } from '../shared/settings';

export const generateMarkdownLinks = (urls: SettingsStorage['urls']): string => {
  // Ensure urls is an object, provide default empty object if not
  const safeUrls = urls && typeof urls === 'object' ? urls : { bo: '', mobile: '', desktop: '', drupal7: '', drupal9: '' };

  return `
# 🌐 Frontend Environments
${safeUrls.bo ? `- **Back Office Tool** → [${safeUrls.bo}](${safeUrls.bo})` : ''}
${safeUrls.mobile ? `- **Mobile Version** → [${safeUrls.mobile}](${safeUrls.mobile})` : ''}
${safeUrls.desktop ? `- **Desktop Version** → [${safeUrls.desktop}](${safeUrls.desktop})` : ''}

---

# 📝 CMS Environments
${safeUrls.drupal7 ? `
## **Drupal 7**
- **Base CMS** → [${safeUrls.drupal7}](${safeUrls.drupal7})
- **Desktop View** → [${safeUrls.drupal7}/fahrradversicherung?deviceoutput=desktop](${safeUrls.drupal7}/fahrradversicherung?deviceoutput=desktop)
- **Mobile View** → [${safeUrls.drupal7}/fahrradversicherung?deviceoutput=mobile](${safeUrls.drupal7}/fahrradversicherung?deviceoutput=mobile)` : ''}
${safeUrls.drupal9 ? `
## **Drupal 9**
- **Desktop View** → [${safeUrls.drupal9}/fahrradversicherung?deviceoutput=desktop](${safeUrls.drupal9}/fahrradversicherung?deviceoutput=desktop)
- **Mobile View** → [${safeUrls.drupal9}/fahrradversicherung?deviceoutput=mobile](${safeUrls.drupal9}/fahrradversicherung?deviceoutput=mobile)` : ''}
`.trim().replace(/^\s*[\r\n]/gm, '');
};

export const generatePlainTextLinks = (urls: SettingsStorage['urls']): string => {
  // Ensure urls is an object, provide default empty object if not
  const safeUrls = urls && typeof urls === 'object' ? urls : { bo: '', mobile: '', desktop: '', drupal7: '', drupal9: '' };

  return `
Frontend Environments:
${safeUrls.bo ? `- Back Office Tool: ${safeUrls.bo}` : ''}
${safeUrls.mobile ? `- Mobile Version: ${safeUrls.mobile}` : ''}
${safeUrls.desktop ? `- Desktop Version: ${safeUrls.desktop}` : ''}

CMS Environments:
${safeUrls.drupal7 ? `
Drupal 7:
- Base CMS: ${safeUrls.drupal7}
- Desktop View: ${safeUrls.drupal7}/fahrradversicherung?deviceoutput=desktop
- Mobile View: ${safeUrls.drupal7}/fahrradversicherung?deviceoutput=mobile` : ''}
${safeUrls.drupal9 ? `
Drupal 9:
- Desktop View: ${safeUrls.drupal9}/fahrradversicherung?deviceoutput=desktop
- Mobile View: ${safeUrls.drupal9}/fahrradversicherung?deviceoutput=mobile` : ''}
`.trim().replace(/^\s*[\r\n]/gm, '');
}; 