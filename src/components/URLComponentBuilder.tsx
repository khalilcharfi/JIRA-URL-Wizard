import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
    X, RefreshCw, GripVertical, Info, Brackets, Check, AlertTriangle, 
    HelpCircle, Save, Eye, EyeOff, Copy, CheckCircle, XCircle 
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    defaultDropAnimationSideEffects,
    MeasuringStrategy,
    MouseSensor,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent, 
    DragEndEvent, 
    UniqueIdentifier,
    DropAnimation,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Type definitions
interface URLComponentBuilderProps {
    prefixes: string[];
    ticketTypes: string[];
    urls: Record<string, string>;
    urlStructure?: string[];
    onSavePattern?: (pattern: string[]) => void;
}

interface Rule {
    id: string;
    name: string;
    description: string;
    validate: (pattern: string[]) => { valid: boolean; message?: string };
}

interface ComponentData {
    id: string;
    text: string;
    type: 'ticket-type' | 'issue-prefix' | 'base-url' | 'separator' | 'regex';
    description: string;
}

// Constants
const PATTERN_CONTAINER_ID = 'pattern-drop-area';
const ITEM_WIDTH = 200; // Approximate width of each pattern item in pixels
const PERMANENT_COMPONENT_BASE_IDS = new Set(['issue-prefix', 'base-url']);

// Helper functions
const getBaseComponentData = (itemId: UniqueIdentifier, allComponents: ComponentData[]): ComponentData | undefined => {
    const itemIdStr = typeof itemId === 'string' ? itemId : String(itemId); 
    const baseId = itemIdStr.startsWith('sep-') ? itemIdStr.substring(0, itemIdStr.lastIndexOf('-'))
        : itemIdStr.startsWith('regex-') ? itemIdStr.substring(0, itemIdStr.lastIndexOf('-'))
            : itemIdStr;
    return allComponents.find(c => c.id === baseId);
};

const generateUniqueIdIfNeeded = (component: ComponentData): UniqueIdentifier => {
    const needsUniqueId = component.type === 'separator' || component.type === 'regex';
    return needsUniqueId ? `${component.id}-${Date.now()}` : component.id;
};

const getComponentStyle = (type: ComponentData['type']) => {
    const styles = {
        'ticket-type': 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
        'issue-prefix': 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
        'base-url': 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300',
        'separator': 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300',
        'regex': 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300',
    };
    
    return styles[type] || 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300';
};

// Component definitions
interface ItemProps {
    id: UniqueIdentifier;
    component: ComponentData;
    allAvailableComponents: ComponentData[];
    isOverlay?: boolean;
    isDragging?: boolean;
}

// AvailableItem Component
const AvailableItem: React.FC<ItemProps & { isUsed: boolean }> = ({ 
    id, component, isUsed, allAvailableComponents 
}) => {
    // Check if this is a dynamic field type
    const isDynamicField = ['ticket-type', 'issue-prefix', 'base-url'].includes(component.type);
    const isDisabled = isDynamicField && isUsed;

    // For ticket type components, add direct drag handler
    const isTicketType = component.type === 'ticket-type';

    // Use sortable with modified options for better touch support
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
        id: id,
        data: { type: 'available', componentData: component },
        disabled: isDisabled,
        attributes: {
            role: 'button',
            tabIndex: 0,
            roleDescription: 'draggable'
        }
    });

    const style = isDragging ? { opacity: 0.5, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' } : undefined;
    const itemStyle = getComponentStyle(component.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners} 
            {...attributes}
            title={component.description}
            className={`relative py-1.5 px-3 rounded-lg select-none shadow-sm transition-all duration-150 group 
                cursor-grab hover:shadow-md hover:scale-105 active:cursor-grabbing touch-manipulation 
                ${itemStyle} border border-transparent hover:border-gray-300 dark:hover:border-gray-600`}
            data-component-type={component.type}
        >
            <ItemContent component={component} />
            <div className="absolute inset-0 rounded-lg bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 pointer-events-none"></div>
        </div>
    );
};

// PatternItem Component
const PatternItem: React.FC<ItemProps & { 
    onDelete: (id: UniqueIdentifier) => void; 
    activeDragId: UniqueIdentifier | null; 
    permanentIds: Set<string> 
}> = ({ 
    id, 
    component, 
    onDelete, 
    allAvailableComponents, 
    isOverlay, 
    activeDragId, 
    permanentIds 
}) => {
    const { 
        attributes, 
        listeners, 
        setNodeRef,
        transform, 
        transition, 
        isDragging: isSortableHookDragging,
    } = useSortable({ 
        id: id, 
        data: { type: 'pattern', componentData: component }, 
    });

    const isItemBeingDragged = activeDragId === id;
    const isCurrentlyDragging = isItemBeingDragged || isSortableHookDragging;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isCurrentlyDragging ? 'none' : transition,
        opacity: isItemBeingDragged && !isOverlay ? 0.4 : 1,
        boxShadow: isCurrentlyDragging ? '0 4px 12px rgba(0,0,0,0.2)' : undefined,
        zIndex: isCurrentlyDragging ? 10 : undefined,
    };

    const itemStyle = getComponentStyle(component.type);
    const isDeletable = !permanentIds.has(component.id);

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center px-3 py-2 rounded-md select-none shadow-sm transition-all duration-150 group border pattern-item ${itemStyle} ${isCurrentlyDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isOverlay ? 'scale-105' : ''}`}
            {...attributes}
        >
            <span 
                {...listeners}
                className="cursor-grab mr-2 text-gray-400 dark:text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity touch-none p-1"
                aria-label="Drag handle"
            >
                <GripVertical size={16} />
            </span>

            <div className="flex-grow min-w-0">
                <div className="text-xs font-semibold mb-0.5 opacity-80 truncate" title={component.description}>
                    {component.description}
                </div>
                <ItemContent component={component} />
            </div>

            {!isOverlay && isDeletable && (
                <button
                    onClick={(e) => { 
                        e.stopPropagation();
                        onDelete(id); 
                    }}
                    className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-150 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 flex-shrink-0"
                    aria-label="Remove component"
                    title="Remove component"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

// ItemContent Component
const ItemContent: React.FC<{ component: ComponentData }> = ({ component }) => {
    switch (component.type) {
        case 'separator':
            return <span className="font-mono text-lg font-semibold">{component.text}</span>;
        case 'regex':
            return (
                <span className="flex items-center gap-1 font-mono text-sm">
                    <Brackets size={14} className="opacity-70" />{component.text}
                </span>
            );
        default:
            return <span className="text-sm font-medium">{component.description}</span>;
    }
};

// ValidationRules Component
const ValidationRules: React.FC<{ 
    rules: Rule[], 
    results: Record<string, { valid: boolean; message?: string }> 
}> = ({ rules, results }) => {
    return (
        <div className="space-y-2">
            {rules.map(rule => {
                const result = results[rule.id];
                const isValid = result?.valid ?? true;
                return (
                    <div key={rule.id} className={`flex items-start p-2 rounded-md transition-colors duration-200 ${ 
                        isValid ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50' 
                              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50'
                    }`}>
                        <div className="mr-3 mt-0.5">
                            {isValid ? 
                                <Check size={16} className="text-green-600 dark:text-green-400" /> : 
                                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                            }
                        </div>
                        <div className="flex-1">
                            <div className={`text-sm font-medium ${ isValid ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400' }`}>
                                {rule.name}
                            </div>
                            <div className={`text-xs ${ isValid ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500' }`}>
                                {result?.message || rule.description}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// URLPreview Component
const URLPreview: React.FC<{
    urls: Record<string, string>,
    buildUrlForBase: (baseUrl: string | undefined, pattern: string[]) => string,
    pattern: UniqueIdentifier[],
    urlValidationResults: Record<string, boolean>,
    validationResults: Record<string, { valid: boolean; message?: string }>,
    validationRules: Rule[]
}> = ({ 
    urls, 
    buildUrlForBase, 
    pattern, 
    urlValidationResults, 
    validationResults,
    validationRules
}) => {
    const allPatternRulesValid = validationRules.every(rule => validationResults[rule.id]?.valid ?? false);
    
    if (Object.entries(urls).length > 0) {
        return (
            <div className="space-y-2">
                {Object.entries(urls).map(([key, value]) => {
                    const constructedUrl = buildUrlForBase(value, pattern.map(id => String(id)));
                    const isUrlValid = urlValidationResults[key] ?? false;
                    const displayValid = allPatternRulesValid && isUrlValid;
                    
                    return (
                        <div key={key} className={`relative rounded-md p-3 border transition-colors duration-150 ${
                            displayValid
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40' 
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
                        }`}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                    {key}
                                    {!displayValid && (
                                        <Tooltip text={!allPatternRulesValid ? "Pattern structure is invalid" : "Generated URL is invalid (check TLD, characters, etc.)"}>
                                            <AlertTriangle size={14} className="ml-2 text-red-500 dark:text-red-400" />
                                        </Tooltip>
                                    )}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => navigator.clipboard.writeText(constructedUrl)}
                                  disabled={!displayValid}
                                  className={`p-1 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
                                  aria-label={`Copy ${key} URL`}
                                  title={displayValid ? `Copy ${key} URL` : "Cannot copy invalid URL"}
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                                {constructedUrl || 'Add components to generate URL'}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
    
    // Fallback preview if no base URLs are defined
    const constructedUrl = buildUrlForBase(undefined, pattern.map(id => String(id)));
    const isFallbackUrlValid = urlValidationResults['fallback'] ?? false;
    const displayValid = allPatternRulesValid && isFallbackUrlValid;

    return (
        <div className={`relative rounded-md p-3 border transition-colors duration-150 ${
            displayValid
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
        }`}>
            <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    Example Preview
                     {!displayValid && (
                        <Tooltip text={!allPatternRulesValid ? "Pattern structure is invalid" : "Generated URL is invalid (check TLD, characters, etc.)"}>
                            <AlertTriangle size={14} className="ml-2 text-red-500 dark:text-red-400" />
                        </Tooltip>
                    )}
                </div>
                 <button 
                  type="button"
                  onClick={() => navigator.clipboard.writeText(constructedUrl)}
                  disabled={!displayValid}
                  className={`p-1 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
                  aria-label={`Copy Example URL`}
                  title={displayValid ? `Copy Example URL` : "Cannot copy invalid URL"}
                >
                    <Copy size={14} />
                </button>
            </div>
            <div className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                {constructedUrl || 'Add components to generate URL'}
            </div>
        </div>
    );
};

// Available Components Section
const AvailableComponentsSection: React.FC<{
    categorizedComponents: {
        dynamic: ComponentData[],
        separators: ComponentData[],
        regex: ComponentData[]
    },
    usedDynamicComponentIds: Set<string>,
    allAvailableComponents: ComponentData[]
}> = ({ 
    categorizedComponents, 
    usedDynamicComponentIds, 
    allAvailableComponents 
}) => {
    return (
        <div className="space-y-4">
            {/* Dynamic components category */}
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Dynamic Fields</div>
                <div className="flex flex-wrap gap-2">
                    {categorizedComponents.dynamic.map((component) => (
                        <AvailableItem
                            key={component.id}
                            id={component.id}
                            component={component}
                            isUsed={usedDynamicComponentIds.has(component.id)}
                            allAvailableComponents={allAvailableComponents}
                        />
                    ))}
                </div>
            </div>
            
            {/* Separators category */}
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Separators</div>
                <div className="flex flex-wrap gap-2">
                    {categorizedComponents.separators.map((component) => (
                        <AvailableItem
                            key={component.id}
                            id={component.id}
                            component={component}
                            isUsed={false}
                            allAvailableComponents={allAvailableComponents}
                        />
                    ))}
                </div>
            </div>
            
            {/* Regex patterns category */}
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Regex Patterns</div>
                <div className="flex flex-wrap gap-2">
                    {categorizedComponents.regex.map((component) => (
                        <AvailableItem
                            key={component.id}
                            id={component.id}
                            component={component}
                            isUsed={false}
                            allAvailableComponents={allAvailableComponents}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main URLComponentBuilder Component
const URLComponentBuilder: React.FC<URLComponentBuilderProps> = ({
    prefixes = [],
    ticketTypes = [],
    urls = {},
    urlStructure = [],
    onSavePattern
}) => {
    // Data initialization with useMemo
    const initialComponents = useMemo(() => [
        { id: 'ticket-type', text: '', type: 'ticket-type', description: 'Ticket Type' },
        { id: 'issue-prefix', text: '', type: 'issue-prefix', description: 'Issue Prefix' },
        { id: 'base-url', text: '', type: 'base-url', description: 'Base URL' }
    ] as ComponentData[], []);

    const separatorComponents = useMemo(() => [
        { id: 'sep-hyphen', text: '-', type: 'separator', description: 'Hyphen' },
        { id: 'sep-dot', text: '.', type: 'separator', description: 'Dot' },
        { id: 'sep-underscore', text: '_', type: 'separator', description: 'Underscore' },
        { id: 'sep-slash', text: '/', type: 'separator', description: 'Slash' }
    ] as ComponentData[], []);

    const regexComponents = useMemo(() => [
        { id: 'regex-numeric', text: '[0-9]+', type: 'regex', description: 'Any Numeric Digits (e.g., 12345)' },
        { id: 'regex-alphanumeric', text: '[a-zA-Z0-9]+', type: 'regex', description: 'Alphanumeric Characters' }
    ] as ComponentData[], []);

    const allAvailableComponents = useMemo(() => 
        [...initialComponents, ...separatorComponents, ...regexComponents],
        [initialComponents, separatorComponents, regexComponents]
    );
    
    // Convert urlStructure from settings to pattern IDs
    const initialPattern = useMemo(() => {
        if (urlStructure && urlStructure.length > 0) {
            return urlStructure.map(item => {
                // Handle dynamic components
                if (item === 'ticketType' || item === 'ticket-type') return 'ticket-type';
                if (item === 'issuePrefix' || item === 'issue-prefix') return 'issue-prefix';
                if (item === 'baseUrl' || item === 'base-url') return 'base-url';
                
                // Handle separators
                if (item === '.') return `sep-dot-${Date.now()}`;
                if (item === '-') return `sep-hyphen-${Date.now()}`;
                if (item === '_') return `sep-underscore-${Date.now()}`;
                if (item === '/') return `sep-slash-${Date.now()}`;
                
                // Handle regex patterns
                if (item === '[0-9]+') return `regex-numeric-${Date.now()}`;
                if (item === '[a-zA-Z0-9]+') return `regex-alphanumeric-${Date.now()}`;
                
                // Handle custom regex patterns
                if (item.startsWith('[') && item.endsWith(']+')) {
                    return `custom-regex-${Date.now()}-${item}`;
                }
                
                // Return the item as is if it doesn't match any known pattern
                return item;
            });
        }
        return ['ticket-type', 'issue-prefix', 'base-url'];
    }, [urlStructure]);
        
    // State management
    const [pattern, setPattern] = useState<UniqueIdentifier[]>(initialPattern);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeType, setActiveType] = useState<'pattern' | 'available' | null>(null);
    const [showRules, setShowRules] = useState(false);
    const [validationResults, setValidationResults] = useState<Record<string, { valid: boolean; message?: string }>>({});
    const [urlValidationResults, setUrlValidationResults] = useState<Record<string, boolean>>({});
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dropTargetArea, setDropTargetArea] = useState<{
        id: UniqueIdentifier | null;
        position: 'before' | 'after' | 'container' | null;
    }>({ id: null, position: null });

    // Validation rules definition
    const validationRules = useMemo(() => [
        {
            id: 'required-base-url',
            name: 'Base URL Required',
            description: 'The pattern must include a base URL component',
            validate: (pattern: string[]) => {
                const isValid = pattern.some(id => {
                    const component = getBaseComponentData(id, allAvailableComponents);
                    return component?.type === 'base-url';
                });
                return { valid: isValid, message: isValid ? undefined : 'Base URL is required' };
            }
        },
        {
            id: 'required-issue-prefix',
            name: 'Issue Prefix Required',
            description: 'The pattern must include an issue prefix component',
            validate: (pattern: string[]) => {
                const isValid = pattern.some(id => {
                    const component = getBaseComponentData(id, allAvailableComponents);
                    return component?.type === 'issue-prefix';
                });
                return { valid: isValid, message: isValid ? undefined : 'Issue Prefix is required' };
            }
        },
        {
            id: 'required-ticket-number',
            name: 'Ticket Number Required',
            description: 'The pattern must include a ticket number component',
            validate: (pattern: string[]) => {
                const isValid = pattern.some(id => {
                    const component = getBaseComponentData(id, allAvailableComponents);
                    return component?.type === 'regex' && component.text === '[0-9]+';
                });
                return { valid: isValid, message: isValid ? undefined : 'Ticket number is required' };
            }
        },
        {
            id: 'valid-tld',
            name: 'Valid Top-Level Domain (TLD)',
            description: 'Ensures the domain part ends with a valid TLD (e.g., .com, .org). Checked in URL Preview.',
            validate: (pattern: string[]) => {
                let structuralIssueFound = false;
                const baseUrlIndex = pattern.findIndex(id => getBaseComponentData(id, allAvailableComponents)?.type === 'base-url');
                
                if (baseUrlIndex !== -1) {
                    // Find the end of the domain part (first slash after base URL or end of pattern)
                    let domainEndIndex = pattern.findIndex((id, index) => index > baseUrlIndex && getBaseComponentData(id, allAvailableComponents)?.id === 'sep-slash');
                    if (domainEndIndex === -1) {
                        domainEndIndex = pattern.length; // No slash found, domain goes to the end
                    }
                    
                    // Check components within the potential domain part (after base-url)
                    for (let i = baseUrlIndex + 1; i < domainEndIndex; i++) {
                        const currentComp = getBaseComponentData(pattern[i], allAvailableComponents);
                        const prevComp = getBaseComponentData(pattern[i-1], allAvailableComponents);

                        // Check 1: Is numeric regex directly after base-url or after a dot?
                        if (currentComp?.id === 'regex-numeric' && 
                            (prevComp?.type === 'base-url' || prevComp?.id === 'sep-dot')) {
                            structuralIssueFound = true;
                            break;
                        }
                        // Check 2: Is ticket-type or issue-prefix inside the domain part?
                        if (currentComp?.type === 'ticket-type' || currentComp?.type === 'issue-prefix') {
                             structuralIssueFound = true;
                             break;
                        }
                    }
                }
                
                // This rule primarily provides structural feedback.
                // The actual URL validation (including TLD check based on base URL value) happens in the preview.
                return { 
                    valid: !structuralIssueFound, 
                    message: structuralIssueFound 
                        ? "Pattern structure might lead to an invalid domain/TLD. Check URL previews carefully."
                        : undefined
                }; 
            }
        },
        {
            id: 'no-adjacent-separators',
            name: 'No Adjacent Separators',
            description: 'The pattern cannot have two separator components next to each other',
            validate: (pattern: string[]) => {
                let isValid = true;
                for (let i = 0; i < pattern.length - 1; i++) {
                    const current = getBaseComponentData(pattern[i], allAvailableComponents);
                    const next = getBaseComponentData(pattern[i + 1], allAvailableComponents);
                    if (current?.type === 'separator' && next?.type === 'separator') {
                        isValid = false;
                        break;
                    }
                }
                return { valid: isValid, message: isValid ? undefined : 'Avoid placing separators directly next to each other' };
            }
        },
        {
            id: 'no-adjacent-regex',
            name: 'No Adjacent Regex Patterns',
            description: 'Cannot place two regex patterns next to each other',
            validate: (pattern: string[]) => {
                let isValid = true;
                for (let i = 0; i < pattern.length - 1; i++) {
                    const current = getBaseComponentData(pattern[i], allAvailableComponents);
                    const next = getBaseComponentData(pattern[i + 1], allAvailableComponents);
                    if (current?.type === 'regex' && next?.type === 'regex') {
                        isValid = false;
                        break;
                    }
                }
                return { 
                    valid: isValid, 
                    message: isValid ? undefined : 'Avoid placing regex patterns directly next to each other' 
                };
            }
        },
        {
            id: 'no-leading-symbols',
            name: 'No Leading Symbols',
            description: 'The URL cannot start with symbols or dots',
            validate: (pattern: string[]) => {
                if (pattern.length === 0) return { valid: true };
                
                const firstComponent = getBaseComponentData(pattern[0], allAvailableComponents);
                const isValid = firstComponent?.type !== 'separator' && firstComponent?.type !== 'regex';
                return { 
                    valid: isValid, 
                    message: isValid ? undefined : 'URL cannot start with symbols or dots' 
                };
            }
        }
    ], [allAvailableComponents]);
        
    // Improved sensor configuration for better drag detection
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 0,
                tolerance: 0,
                delay: 0,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 0,
                tolerance: 0,
                delay: 0,
            },
            onActivation: ({ event }) => {
                if (event instanceof TouchEvent) {
                    const target = event.target as HTMLElement;
                    if (target) {
                        target.style.touchAction = 'none';
                    }
                }
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Add a custom modifier for drag visualization
    const customDropAnimationModifier = {
        active: {
            opacity: '0.8',
            scale: '1.05',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: customDropAnimationModifier
        })
    };

    // Define pattern container as a droppable area
    const { setNodeRef: setPatternDropRef } = useDroppable({
        id: PATTERN_CONTAINER_ID,
        data: { type: 'pattern-container' }
    });
    
    // URL Building and validation functions
    const validateUrl = useCallback((url: string) => {
        // Check for invalid starting characters like @
        if (/^@/.test(url)) {
            return false;
        }
        
        // Simple and focused URL validation regex
        const urlRegex = /\b((https?|ftp):\/\/)?((([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,})|(localhost)|(\d{1,3}(\.\d{1,3}){3}))(:\d+)?(\/[^\s]*)?(\?[^\s#]*)?(#[^\s]*)?\b/;
        
        // Check if the URL matches the basic pattern
        if (!urlRegex.test(url)) {
            return false;
        }

        // Extract the hostname part
        let hostname = url;
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            hostname = urlObj.hostname;
        } catch (e) {
            // If URL parsing fails, try to extract hostname manually
            const match = url.match(/^(?:https?:\/\/)?([^\/\?#]+)/);
            if (match) {
                hostname = match[1];
            }
        }

        // Split hostname into parts and check each part
        const parts = hostname.split('.');
        for (const part of parts) {
            // Check if any part starts with a dot or hyphen
            if (part.startsWith('.') || part.startsWith('-')) {
                return false;
            }
            
            // Check for invalid characters in domain parts
            if (!/^[a-zA-Z0-9\-_]+$/.test(part)) {
                return false;
            }
        }

        // Check for valid TLD (Top-Level Domain)
        if (parts.length > 1) {
            const tld = parts[parts.length - 1];
            
            // Valid TLDs should only contain letters (a-z)
            // This will catch invalid TLDs like .de12345
            if (!/^[a-z]{2,}$/.test(tld)) {
                return false;
            }
        }

        return true;
    }, []);

    const buildUrlForBase = useCallback((baseUrlValue: string | undefined, currentPattern: string[]) => {
        let url = '';
        const finalBaseUrl = baseUrlValue || 'https://your-jira.example.com';

        currentPattern.forEach(itemId => {
            const component = getBaseComponentData(itemId, allAvailableComponents);
            if (component) {
                switch (component.type) {
                    case 'ticket-type':
                        url += ticketTypes[0] || 'TYPE';
                        break;
                    case 'issue-prefix':
                        url += prefixes[0] || 'PREFIX';
                        break;
                    case 'base-url':
                        let formattedBaseUrl = finalBaseUrl;
                        if (!/^https?:\/\//i.test(formattedBaseUrl)) {
                            formattedBaseUrl = `https://${formattedBaseUrl}`;
                        }
                        formattedBaseUrl = formattedBaseUrl.replace(/\/$/, "");

                        if (!url) {
                            url += formattedBaseUrl;
                        } else {
                            url += formattedBaseUrl.replace(/^https?:\/\//, ''); 
                        }
                        break;
                    case 'separator':
                        url += component.text;
                        break;
                    case 'regex':
                        if (component.id === 'regex-numeric') url += '12345';
                        else if (component.id === 'regex-alphanumeric') url += 'ABC123';
                        else url += '[REGEX]';
                        break;
                }
            } else {
                console.warn("Component data not found for ID:", itemId);
                url += `[${itemId}]`;
            }
        });

        const firstPatternComp = getBaseComponentData(currentPattern[0], allAvailableComponents);
        if (url && !url.startsWith('http') && firstPatternComp?.type !== 'base-url') {
            return `https://${url}`;
        }

        return url || '';
    }, [prefixes, ticketTypes, allAvailableComponents]);

    const validateConstructedUrls = useCallback(() => {
        const results: Record<string, boolean> = {};
        const currentPatternStringArray = pattern.map(id => String(id));

        if (Object.keys(urls).length === 0) {
            const fallbackUrl = buildUrlForBase(undefined, currentPatternStringArray);
            results['fallback'] = validateUrl(fallbackUrl);
        } else {
            Object.entries(urls).forEach(([key, value]) => {
                const constructedUrl = buildUrlForBase(value, currentPatternStringArray);
                results[key] = validateUrl(constructedUrl);
            });
        }
        setUrlValidationResults(results);
    }, [urls, pattern, validateUrl, buildUrlForBase]);

    // Effect hooks
    useEffect(() => {
        const results: Record<string, { valid: boolean; message?: string }> = {};
        const currentPatternStringArray = pattern.map(id => String(id));
        validationRules.forEach(rule => {
            results[rule.id] = rule.validate(currentPatternStringArray);
        });
        setValidationResults(results);
        
        validateConstructedUrls();
    }, [pattern, validationRules, validateConstructedUrls]);

    // Add a useEffect to reload the pattern when urlStructure changes
    useEffect(() => {
        if (urlStructure && urlStructure.length > 0) {
            const mappedPattern = urlStructure.map(item => {
                // Handle dynamic components with consistent naming
                if (item === 'ticketType' || item === 'ticket-type') return 'ticket-type';
                if (item === 'issuePrefix' || item === 'issue-prefix') return 'issue-prefix';
                if (item === 'baseUrl' || item === 'base-url') return 'base-url';
                
                // Handle separators
                if (item === '.') return `sep-dot-${Date.now()}`;
                if (item === '-') return `sep-hyphen-${Date.now()}`;
                if (item === '_') return `sep-underscore-${Date.now()}`;
                if (item === '/') return `sep-slash-${Date.now()}`;
                
                // Handle regex patterns
                if (item === '[0-9]+') return `regex-numeric-${Date.now()}`;
                if (item === '[a-zA-Z0-9]+') return `regex-alphanumeric-${Date.now()}`;
                
                // Handle custom regex patterns
                if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']+')) {
                    return `custom-regex-${Date.now()}-${item}`;
                }
                
                // Return the item as is if it doesn't match any known pattern
                return item;
            });
            setPattern(mappedPattern);
        }
    }, [urlStructure]);

    // Event handlers
    const handleDeleteComponent = useCallback((idToDelete: UniqueIdentifier) => {
        // Prevent deletion of permanent components
        if (PERMANENT_COMPONENT_BASE_IDS.has(String(idToDelete))) {
            console.log(`Prevented deletion of permanent component: ${idToDelete}`);
            return;
        }
        
        const newPattern = pattern.filter(id => id !== idToDelete);
        setPattern(newPattern);
        
        // Automatically save the pattern
        const isPatternValid = Object.values(validationResults).every(result => result.valid);
        if (onSavePattern && isPatternValid) {
            // Convert to the correct format expected by settings
            const formattedPattern = newPattern.map(id => {
                const idStr = String(id);
                if (idStr === 'ticket-type') return 'ticketType';
                if (idStr === 'issue-prefix') return 'issuePrefix';
                if (idStr === 'base-url') return 'baseUrl';
                if (idStr.startsWith('sep-dot')) return '.';
                if (idStr.startsWith('sep-hyphen')) return '-';
                if (idStr.startsWith('sep-underscore')) return '_';
                if (idStr.startsWith('sep-slash')) return '/';
                if (idStr.startsWith('regex-numeric')) return '[0-9]+';
                if (idStr.startsWith('regex-alphanumeric')) return '[a-zA-Z0-9]+';
                if (idStr.startsWith('custom-regex-')) {
                    const match = idStr.match(/custom-regex-\d+-(.+)/);
                    return match ? match[1] : idStr;
                }
                return idStr;
            });
            onSavePattern(formattedPattern);
        }
    }, [pattern, onSavePattern, validationResults]);

    const handleReset = useCallback(() => {
        let newPattern: UniqueIdentifier[];
        
        // Reset to the pattern from settings or fall back to default
        if (urlStructure && urlStructure.length > 0) {
            newPattern = urlStructure.map(item => {
                // Handle dynamic components with consistent naming
                if (item === 'ticketType' || item === 'ticket-type') return 'ticket-type';
                if (item === 'issuePrefix' || item === 'issue-prefix') return 'issue-prefix';
                if (item === 'baseUrl' || item === 'base-url') return 'base-url';
                
                // Handle separators
                if (item === '.') return `sep-dot-${Date.now()}`;
                if (item === '-') return `sep-hyphen-${Date.now()}`;
                if (item === '_') return `sep-underscore-${Date.now()}`;
                if (item === '/') return `sep-slash-${Date.now()}`;
                
                // Handle regex patterns
                if (item === '[0-9]+') return `regex-numeric-${Date.now()}`;
                if (item === '[a-zA-Z0-9]+') return `regex-alphanumeric-${Date.now()}`;
                
                // Handle custom regex patterns
                if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']+')) {
                    return `custom-regex-${Date.now()}-${item}`;
                }
                
                // Return the item as is if it doesn't match any known pattern
                return item;
            });
        } else {
            // Reset to default pattern
            newPattern = ['ticket-type', 'issue-prefix', 'base-url'];
        }
        
        setPattern(newPattern);
        
        // Automatically save the pattern
        if (onSavePattern) {
            // Convert to the correct format expected by settings
            const formattedPattern = newPattern.map(id => {
                const idStr = String(id);
                if (idStr === 'ticket-type') return 'ticketType';
                if (idStr === 'issue-prefix') return 'issuePrefix';
                if (idStr === 'base-url') return 'baseUrl';
                if (idStr.startsWith('sep-dot')) return '.';
                if (idStr.startsWith('sep-hyphen')) return '-';
                if (idStr.startsWith('sep-underscore')) return '_';
                if (idStr.startsWith('sep-slash')) return '/';
                if (idStr.startsWith('regex-numeric')) return '[0-9]+';
                if (idStr.startsWith('regex-alphanumeric')) return '[a-zA-Z0-9]+';
                if (idStr.startsWith('custom-regex-')) {
                    const match = idStr.match(/custom-regex-\d+-(.+)/);
                    return match ? match[1] : idStr;
                }
                return idStr;
            });
            onSavePattern(formattedPattern);
        }
    }, [urlStructure, onSavePattern]);

    const handleSavePattern = useCallback(() => {
        // Convert UniqueIdentifier[] to string[] with proper format mapping
        const formattedPattern = pattern.map(id => {
            const idStr = String(id);
            if (idStr === 'ticket-type') return 'ticketType';
            if (idStr === 'issue-prefix') return 'issuePrefix';
            if (idStr === 'base-url') return 'baseUrl';
            if (idStr.startsWith('sep-dot')) return '.';
            if (idStr.startsWith('sep-hyphen')) return '-';
            if (idStr.startsWith('sep-underscore')) return '_';
            if (idStr.startsWith('sep-slash')) return '/';
            if (idStr.startsWith('regex-numeric')) return '[0-9]+';
            if (idStr.startsWith('regex-alphanumeric')) return '[a-zA-Z0-9]+';
            if (idStr.startsWith('custom-regex-')) {
                const match = idStr.match(/custom-regex-\d+-(.+)/);
                return match ? match[1] : idStr;
            }
            return idStr;
        });
        
        if (onSavePattern) {
            onSavePattern(formattedPattern);
        }
    }, [pattern, onSavePattern]);

    // DnD Event Handlers
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        
        // Log the start of dragging for debugging purposes
        console.log('Drag started:', { 
            id: active.id, 
            type: active.data.current?.type,
            data: active.data.current,
            rect: active.rect,
        });
        
        // More robust type extraction - default to 'available' for components being dragged from the available list
        let type = active.data.current?.type || null;
        if (type !== 'pattern' && type !== 'available') {
            // If we can't determine the type, check if it's in the pattern
            type = pattern.includes(active.id) ? 'pattern' : 'available';
        }
        
        setActiveId(active.id);
        setActiveType(type);
        
        // Add a class to the body to indicate dragging is in progress
        document.body.classList.add('dragging-in-progress');
    }, [pattern]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        
        if (!over) {
            setDragOverIndex(null);
            setDropTargetArea({ id: null, position: null });
            return;
        }
        
        // Set drop target area for visual feedback
        if (over.id === PATTERN_CONTAINER_ID) {
            setDropTargetArea({ id: PATTERN_CONTAINER_ID, position: 'container' });
            setDragOverIndex(pattern.length);
            return;
        }
        
        if (pattern.includes(over.id)) {
            const overIndex = pattern.indexOf(over.id);
            setDragOverIndex(overIndex);
            
            // Determine if dropping before or after the target
            const deltaX = event.delta.x;
            const position = deltaX < 0 ? 'before' : 'after';
            setDropTargetArea({ id: over.id, position });
        } else {
            setDropTargetArea({ id: null, position: null });
        }
    }, [pattern]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        
        // Log drag end for debugging
        console.log('Drag ended:', { 
            activeId: active.id, 
            overId: over?.id,
            activeType: active.data.current?.type,
            overType: over?.data.current?.type,
        });
        
        // Clean up state
        setActiveId(null);
        setActiveType(null);
        setDragOverIndex(null);
        setDropTargetArea({ id: null, position: null });
        
        // Remove the dragging class from the body
        document.body.classList.remove('dragging-in-progress');
        
        if (over && over.id !== active.id) {
            let newPattern: UniqueIdentifier[] = [...pattern];
            
            // Handle dropping from available items to pattern
            if (active.data.current?.type === 'available') {
                const component = active.data.current.componentData as ComponentData;
                const uniqueId = generateUniqueIdIfNeeded(component);
                
                // Case 1: Drop on the container itself
                if (over.id === PATTERN_CONTAINER_ID) {
                    newPattern = [...pattern, uniqueId];
                }
                // Case 2: Drop on a specific position in the pattern
                else if (pattern.includes(over.id)) {
                    const overIndex = pattern.indexOf(over.id);
                    
                    // Simplified insertion: always insert *after* the item dropped onto
                    newPattern = [...pattern.slice(0, overIndex + 1), uniqueId, ...pattern.slice(overIndex + 1)];
                }
            }
            // Handle sorting within pattern
            else if (active.data.current?.type === 'pattern' && pattern.includes(over.id)) {
                const oldIndex = pattern.indexOf(active.id);
                const newIndex = pattern.indexOf(over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                    newPattern = arrayMove(pattern, oldIndex, newIndex);
                }
            }
            
            setPattern(newPattern);
            
            // Automatically save the pattern
            const isPatternValid = Object.values(validationResults).every(result => result.valid);
            if (onSavePattern && isPatternValid) {
                // Convert to the correct format expected by settings
                const formattedPattern = newPattern.map(id => {
                    const idStr = String(id);
                    if (idStr === 'ticket-type') return 'ticketType';
                    if (idStr === 'issue-prefix') return 'issuePrefix';
                    if (idStr === 'base-url') return 'baseUrl';
                    if (idStr.startsWith('sep-dot')) return '.';
                    if (idStr.startsWith('sep-hyphen')) return '-';
                    if (idStr.startsWith('sep-underscore')) return '_';
                    if (idStr.startsWith('sep-slash')) return '/';
                    if (idStr.startsWith('regex-numeric')) return '[0-9]+';
                    if (idStr.startsWith('regex-alphanumeric')) return '[a-zA-Z0-9]+';
                    if (idStr.startsWith('custom-regex-')) {
                        const match = idStr.match(/custom-regex-\d+-(.+)/);
                        return match ? match[1] : idStr;
                    }
                    return idStr;
                });
                onSavePattern(formattedPattern);
            }
        }
    }, [pattern, validationResults, onSavePattern]);

    // Reset drop target area when drag ends
    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setActiveType(null);
        setDragOverIndex(null);
        setDropTargetArea({ id: null, position: null });
        
        // Remove the dragging class from the body
        document.body.classList.remove('dragging-in-progress');
        
        console.log('Drag cancelled');
    }, []);

    // Calculate which components are already used in the pattern
    const usedDynamicComponentIds = useMemo(() => {
        const usedIds = new Set<string>();
        pattern.forEach(id => {
            const idStr = String(id);
            
            // First check exact matches for basic components
            if (['ticket-type', 'issue-prefix', 'base-url'].includes(idStr)) {
                usedIds.add(idStr);
                return;
            }
            
            // Then check for base components by extracting the base ID
            const baseId = idStr.includes('-') ? idStr.split('-')[0] : idStr;
            
            // For pattern items that are dynamic components (can only appear once)
            if (['ticket-type', 'issue-prefix', 'base-url'].includes(baseId)) {
                usedIds.add(baseId);
            }
        });
        return usedIds;
    }, [pattern]);

    // Get active component for the drag overlay
    const activeComponent = useMemo(() => {
        if (!activeId) return null;
        
        if (activeType === 'available') {
            return allAvailableComponents.find(c => c.id === String(activeId));
        } else {
            const component = getBaseComponentData(activeId, allAvailableComponents);
            return component || null;
        }
    }, [activeId, activeType, allAvailableComponents]);

    // Organize available components by category
    const categorizedComponents = useMemo(() => ({
        dynamic: initialComponents,
        separators: separatorComponents,
        regex: regexComponents
    }), [initialComponents, separatorComponents, regexComponents]);

    // Permanent IDs that cannot be deleted
    const permanentIds = useMemo(() => 
        new Set<string>(initialComponents.filter(c => 
            PERMANENT_COMPONENT_BASE_IDS.has(c.id)
        ).map(c => c.id)),
        [initialComponents]
    );

    const allRulesValid = validationRules.every(rule => validationResults[rule.id]?.valid ?? false);

    return (
        <div className="space-y-5">
            <section>
                <div className="flex flex-wrap items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">URL Structure</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                            onClick={() => setShowRules(!showRules)}
                            title={showRules ? "Hide rules" : "Show rules"}
                        >
                            {showRules ? (
                                <>
                                    <Eye size={14} className="mr-1" />
                                    Hide Rules
                                </>
                            ) : (
                                <>
                                    <EyeOff size={14} className="mr-1" />
                                    Show Rules
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Build your custom JIRA URL structure by dragging and dropping components. This pattern defines how your JIRA ticket IDs will be transformed into URLs. Ensure patterns create valid URLs (correct TLDs, no invalid starting characters) and avoid placing regex patterns consecutively.
                </div>
                
                {showRules && (
                    <div className="mb-4">
                        <ValidationRules rules={validationRules} results={validationResults} />
                    </div>
                )}
                
                <div className="space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                        measuring={{
                            droppable: {
                                strategy: MeasuringStrategy.Always
                            }
                        }}
                        autoScroll={true}
                    >
                        {/* Debug information for development */}
                        <div className="mb-3 text-xs bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800/50">
                            Tip: Grab and hold the ticket type component firmly, then drag it to the pattern area below.
                            <div className="mt-1 flex space-x-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/50 dark:text-blue-300">Active ID: {activeId?.toString() || "None"}</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">Type: {activeType || "None"}</span>
                            </div>
                        </div>
                        
                        <AvailableComponentsSection 
                            categorizedComponents={categorizedComponents}
                            usedDynamicComponentIds={usedDynamicComponentIds}
                            allAvailableComponents={allAvailableComponents}
                        />
                        
                        <div 
                            className="mt-4 p-3 rounded-md border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-h-[100px] flex flex-col"
                        >
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                URL Pattern
                            </div>
                            
                            <div 
                                ref={setPatternDropRef}
                                className={`flex flex-wrap gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[60px] pattern-container ${
                                    dropTargetArea.id === PATTERN_CONTAINER_ID && pattern.length === 0 
                                    ? 'ring-2 ring-blue-400 dark:ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                    : ''
                                }`}
                            >
                                <SortableContext items={pattern} strategy={horizontalListSortingStrategy}>
                                    {pattern.map((id, index) => {
                                        const component = getBaseComponentData(id, allAvailableComponents);
                                        if (!component) return null;
                                        
                                        // Add drop indicators
                                        const showBeforeIndicator = dropTargetArea.id === id && dropTargetArea.position === 'before';
                                        const showAfterIndicator = dropTargetArea.id === id && dropTargetArea.position === 'after';
                                        
                                        return (
                                            <React.Fragment key={id}>
                                                {showBeforeIndicator && (
                                                    <div className="self-stretch w-1 m-0 bg-blue-500 rounded-full animate-pulse" />
                                                )}
                                                <PatternItem
                                                    id={id}
                                                    component={component}
                                                    onDelete={handleDeleteComponent}
                                                    allAvailableComponents={allAvailableComponents}
                                                    activeDragId={activeId}
                                                    permanentIds={permanentIds}
                                                />
                                                {showAfterIndicator && (
                                                    <div className="self-stretch w-1 m-0 bg-blue-500 rounded-full animate-pulse" />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </SortableContext>
                                
                                {pattern.length === 0 && (
                                    <div className={`flex items-center justify-center w-full h-12 text-gray-400 dark:text-gray-500 ${
                                        dropTargetArea.id === PATTERN_CONTAINER_ID ? 'text-blue-500 dark:text-blue-400' : ''
                                    }`}>
                                        Drag components here to build your URL pattern
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 mt-4">
                            URL Preview
                        </h3>
                        
                        <URLPreview
                            urls={urls}
                            buildUrlForBase={buildUrlForBase}
                            pattern={pattern}
                            urlValidationResults={urlValidationResults}
                            validationResults={validationResults}
                            validationRules={validationRules}
                        />
                        
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId && activeComponent ? (
                                activeType === 'available' ? (
                                    <div 
                                        className={`relative py-1.5 px-3 rounded-lg select-none shadow-md scale-105 ${getComponentStyle(activeComponent.type)}`}
                                        style={{ transformOrigin: '0 0' }}
                                    >
                                        <ItemContent component={activeComponent} />
                                    </div>
                                ) : (
                                    <PatternItem
                                        id={activeId}
                                        component={activeComponent}
                                        onDelete={handleDeleteComponent}
                                        isOverlay
                                        allAvailableComponents={allAvailableComponents}
                                        activeDragId={activeId}
                                        permanentIds={permanentIds}
                                    />
                                )
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </section>
        </div>
    );
};

// Then, add a basic Tooltip component implementation
const Tooltip: React.FC<{ text: string; children: React.ReactElement }> = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded z-10 whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
};

export default URLComponentBuilder;
        