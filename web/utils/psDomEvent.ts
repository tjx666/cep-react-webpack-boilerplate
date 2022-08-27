/**
 * @see https://github.com/antonio-gomez/photoshop-dom-event
 * modified from photoshop-dom-event and transformed to typescript
 */

import EventEmitter from 'events';

import csInterface, { CSEvent } from './CSInterface';

export interface PSDOMEventResponse {
    extensionId: string;
    eventData: any;
    eventID: number;
    appId: string;
    type: string;
    scope: string;
}

function getHostVersion() {
    // Adobe Photoshop CC2014   -> 15.x.x  (15)
    // Adobe Photoshop CC2015   -> 16.x.x  (16)
    // Adobe Photoshop CC2015.5 -> 17.x.x  (17)
    return Number(csInterface.getHostEnvironment().appVersion.split('.')[0]);
}

class PhotoshopDOMEvent extends EventEmitter {
    static psDOMEvent = new PhotoshopDOMEvent();

    private _appId = csInterface.getApplicationID();
    private _extensionId = csInterface.getExtensionID();
    private _hostVersion = getHostVersion();
    private _now = new Date();

    public globalEventType =
        this._hostVersion == 15
            ? 'PhotoshopCallback'
            : 'com.adobe.PhotoshopJSONCallback' + this._extensionId;

    private constructor() {
        super();
        // Global event listener for PhotoshopJSONCallback event
        csInterface.addEventListener(this.globalEventType, this._handleGlobalEvent);
    }

    private _handleGlobalEvent = (csEvent: CSEvent) => {
        // Avoid multiple event call stack error on Adobe Photoshop CC2014
        if (this._hostVersion == 15) {
            const eventFiredDate = new Date();
            if (this._now.toString() !== eventFiredDate.toString()) {
                this._now = eventFiredDate;
                this._callbackManager(csEvent);
            }
        } else {
            this._callbackManager(csEvent);
        }
    };

    private async _callbackManager(rawCSEventData: CSEvent) {
        const data = this._cleanRetrievedData(rawCSEventData);
        const stringID = await this._getStringID(data.eventID);
        this.emit(stringID, data);
    }

    private _cleanRetrievedData(rawCSEventData: any): PSDOMEventResponse {
        // Adobe Photoshop CC2014
        if (this._hostVersion === 15) {
            return {
                extensionId: this._extensionId,
                eventID: rawCSEventData.data.split(',')[0],
                appId: rawCSEventData.appId,
                type: rawCSEventData.type,
                scope: rawCSEventData.scope,
                eventData: {},
            };
        }
        // Adobe Photoshop CC2015 && // Adobe Photoshop CC2015.5
        else {
            if (typeof rawCSEventData.data === 'string') {
                const data = JSON.parse(rawCSEventData.data.replace('ver1,{', '{'));
                return {
                    extensionId: this._extensionId,
                    eventData: data.eventData,
                    eventID: data.eventID,
                    appId: rawCSEventData.appId,
                    type: rawCSEventData.type,
                    scope: rawCSEventData.scope,
                };
            } else {
                throw new Error(
                    'Unknown data type retrieved from the CS Event. Expected a string for csEvent.data',
                );
            }
        }
    }

    private async _getTypeID(eventId: string): Promise<number> {
        const typeID = await csInterface.evalScript('app.charIDToTypeID("' + eventId + '");');
        if (typeID.toString() === 'EvalScript error.') {
            return Number(await csInterface.evalScript('app.stringIDToTypeID("' + eventId + '");'));
        } else {
            return Number(typeID);
        }
    }

    private async _getStringID(typeID: number): Promise<string> {
        return csInterface.evalScript(`app.typeIDToStringID(${typeID});`);
    }

    async onEvent(eventID: string, callback: (response: PSDOMEventResponse) => void) {
        const event = new CSEvent(
            'com.adobe.PhotoshopRegisterEvent',
            'APPLICATION',
            this._appId,
            this._extensionId,
        );
        const typeID = await this._getTypeID(eventID);
        event.data = String(typeID);
        event.extensionId = this._extensionId;
        // eventID 可能是 charID 也可能是 stringID，注册的时候统一成 stringID
        const eventName = await this._getStringID(typeID);
        this.addListener(eventName, callback);
        csInterface.dispatchEvent(event);
        return typeID;
    }

    async stopListeningEvent(eventID: string, callback?: (response: PSDOMEventResponse) => void) {
        const typeID = await this._getTypeID(eventID);
        const eventName = await this._getStringID(typeID);
        let callbackCount = this.listenerCount(eventName);

        if (callback) {
            this.removeListener(eventName, callback);
        } else {
            this.removeAllListeners(eventName);
        }

        if (this.listenerCount(eventName) === callbackCount) {
            throw new Error("Can't unregister listener for the provided eventID: " + eventID);
        }

        callbackCount = this.listenerCount(eventName);
        if (callbackCount === 0) {
            const event = new CSEvent(
                'com.adobe.PhotoshopUnRegisterEvent',
                'APPLICATION',
                this._appId,
                this._extensionId,
            );
            event.data = String(typeID);
            event.extensionId = this._extensionId;
            csInterface.dispatchEvent(event);
        }
    }

    destroy() {
        this.removeAllListeners();
        csInterface.removeEventListener(this.globalEventType, this._handleGlobalEvent);
    }

    onActiveLayerNameChange(callback: (response: PSDOMEventResponse) => void) {
        this.onEvent('select', callback);
        this.onEvent('selectNoLayers', callback);
        this.onEvent('historyStateChanged', callback);
        const handleSet = (event: PSDOMEventResponse) => {
            const target = event.eventData?.null;
            const to = event.eventData?.to;
            const isRenameLayerEvent =
                target?._enum === 'ordinal' &&
                target?._ref === 'layer' &&
                target?._value === 'targetEnum' &&
                to?._obj === 'layer' &&
                to?._name !== undefined;
            if (isRenameLayerEvent) {
                callback(event);
            }
        };
        this.onEvent('set', handleSet);

        return () => {
            this.stopListeningEvent('select', callback);
            this.stopListeningEvent('selectNoLayers', callback);
            this.stopListeningEvent('historyStateChanged', callback);
            this.stopListeningEvent('set', handleSet);
        };
    }
}

export default PhotoshopDOMEvent.psDOMEvent;
