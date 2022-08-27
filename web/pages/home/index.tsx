import { useCallback, useState } from 'react';
import { useLifecycles } from 'react-use';
import csInterface from 'utils/CSInterface';
import psDomEvent from 'utils/psDomEvent';
import './style.less';

async function getActiveLayerName() {
    return (await csInterface.invoke<string>('layer.getActiveLayerName')) ?? '当前未选中图层';
}

let off: any;
export default function Home() {
    const [activeLayerName, setActiveLayerName] = useState('');

    const handle = useCallback(async () => {
        setActiveLayerName(await getActiveLayerName());
        console.log(activeLayerName);
    }, []);

    useLifecycles(
        () => {
            handle();
            off = psDomEvent.onActiveLayerNameChange(handle);
        },
        () => {
            off!();
        },
    );

    return (
        <div className="home">
            <h2 className="active-layer-name">Active Layer: {activeLayerName}</h2>
        </div>
    );
}
