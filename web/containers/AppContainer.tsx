import { useKBar } from 'kbar';
import { useCallback, useEffect } from 'react';

interface AppContainerProps {
    children: React.ReactNode;
}

export default function AppContainer({ children }: AppContainerProps) {
    const { query } = useKBar();

    const handler = useCallback(
        (e: KeyboardEvent) => {
            if (e.metaKey && e.shiftKey && e.key === 'p') {
                query.toggle();
            }
        },
        [query],
    );

    useEffect(() => {
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handler]);

    return <> {children}</>;
}
