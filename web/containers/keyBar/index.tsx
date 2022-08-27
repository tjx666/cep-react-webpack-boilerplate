import { exec } from 'child_process';
import {
    Action,
    KBarAnimator,
    KBarPortal,
    KBarPositioner,
    KBarProvider,
    KBarResults,
    KBarSearch,
    useMatches,
} from 'kbar';

import { execShellScript } from 'utils/common';
import { isMac, logFilePath } from 'utils/constants';

const positionStyle: React.CSSProperties = {
    margin: '14vh auto',
    padding: '0',
    width: '75%',
};

const searchStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    outline: 'none',
    border: 'none',
    background: 'black',
    color: 'white',
    caretColor: 'white',
};

const animatorStyle: React.CSSProperties = {
    maxWidth: '600px',
    width: '100%',
    background: 'var(--background)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
};

const groupNameStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    opacity: 0.5,
};

export const actions: Action[] = [
    {
        id: 'Chrome Inspect',
        name: 'Chrome Inspect',
        shortcut: [],
        keywords: 'i',
        perform: () => {
            const script = isMac
                ? 'open -a "Google Chrome" chrome://inspect'
                : 'start chrome chrome://inspect';
            execShellScript(script);
        },
    },
    {
        id: 'View Log in VSCode',
        name: 'View Log in VSCode',
        shortcut: [],
        keywords: 'l',
        perform: () => {
            if (!isMac) {
                execShellScript(`explorer ${logFilePath}`);
                return;
            }
            const codePath = '/usr/local/bin/code';
            const codeInsiderPath = '/usr/local/bin/code-insiders';
            exec(`command -v '${codeInsiderPath}'`, (error) => {
                if (error) {
                    execShellScript(`${codePath} -r '${logFilePath}'`);
                } else {
                    execShellScript(`${codeInsiderPath} -r '${logFilePath}'`);
                }
            });
        },
    },
    {
        id: 'Open Log File',
        name: 'Open Log File',
        shortcut: [],
        keywords: '',
        perform: () => {
            const script = isMac ? `open -R '${logFilePath}'` : `explorer ${logFilePath}`;
            execShellScript(script);
        },
    },
    {
        id: 'Clear LocalStorage',
        name: 'Clear LocalStorage',
        shortcut: [],
        keywords: '',
        perform: () => {
            window.localStorage.clear();
        },
    },
];

export function RenderResults() {
    const { results } = useMatches();
    return (
        <KBarResults
            items={results}
            onRender={({ item, active }) => {
                return typeof item === 'string' ? (
                    <div style={groupNameStyle}> {item}</div>
                ) : (
                    <div
                        style={{
                            background: 'black',
                            padding: '8px 0',
                            paddingLeft: '10px',
                            color: '#EEE',
                            cursor: 'pointer',
                            ...(active
                                ? {
                                      paddingLeft: '8px',
                                      background: '#222',
                                      borderLeft: '2px solid white',
                                  }
                                : {}),
                        }}
                    >
                        {item.name}
                    </div>
                );
            }}
        />
    );
}

function CommandBar() {
    return (
        <KBarPortal>
            <KBarPositioner style={positionStyle}>
                <KBarAnimator style={animatorStyle}>
                    <KBarSearch style={searchStyle} />
                    <RenderResults />
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    );
}

interface KeyBarProps {
    children: React.ReactNode;
}

export function KeyBar({ children }: KeyBarProps) {
    return (
        <KBarProvider actions={actions}>
            <CommandBar />
            {children}
        </KBarProvider>
    );
}
