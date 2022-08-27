/* eslint-disable @typescript-eslint/ban-types */
import { CSEvent, CSInterface } from '../utils/CSInterface';
import { Encoding, FS, Process, Util } from './cep-engine-extensions';

declare global {
    interface IMSInterface {
        imsConnect(): string;
        imsDisconnect(imsRef: string): void;
        imsFetchAccounts(imsRef: string, clientId: string): string;
        imsFetchUserProfileData(imsRef: string, userAccountGuid: string): string;
        imsConnectWithEndpoint(imsEndpoint: any): string;
        imsFetchAccessToken(
            imsRef: string,
            clientId: string,
            clientSecret: string,
            userAccountGuid: string,
            serviceAccountGuid?: string,
            scope?: string,
        ): boolean;
        imsFetchContinueToken(
            imsRef: any,
            bearerToken: string,
            targetClientId: string,
            redirectUri?: string,
            scope?: string,
            responseType?: string,
            locale?: string,
        ): string;
        imsRevokeDeviceToken(
            imsRef: string,
            clientId: string,
            clientSecret: string,
            userAccountGuid: string,
            serviceAccountGuid?: string,
        ): boolean;

        imsSetProxyCredentials(proxyUsername: string, proxyPassword: string): void;

        showAAM(
            clientId: string,
            clientSecret: string,
            redirectUri: string,
            userAccountGuid: string,
            serviceAccountGuid: string,
            scope: string,
        ): boolean;

        imsGetCurrentUserId(): object;
        imsGetCurrentUserIdHelper(callback: Function): void;

        imsLogoutUser(imsRef: string, userAccountGuid: string, clientId: string): object;
    }

    interface CEP extends IMSInterface {
        addEventListener(type: string, listener: Function, obj?: object): void;
        removeEventListener(type: string, listener: any, obj?: object): void;
        requestOpenExtension(extensionId: string, startupParams?: string): void;
        closeExtension(): void;

        dispatchEvent(event: CSEvent): void;
        dumpInstallationInfo(): string;
        evalScript(script: string, callback?: Function): void;
        getCurrentApiVersion(): string;
        getCurrentImsUserId(): object;
        getExtensionId(): string;
        getExtensions(extensionIds?: string): string;
        getHostCapabilities(): string;
        getHostEnvironment(): string;
        getMonitorScaleFactor(): number;
        getNetworkPreferences(): string;
        getScaleFactor(): number;
        getSystemPath(pathType: CSInterface.SystemPath): string;
        initResourceBundle(): string;

        invokeAsync(type: string, params: string, callback: Function, obj?: object): Function;
        invokeSync(type: string, a?: string): string;

        registerInvalidCertificateCallback(callback: Function): void;
        registerKeyEventsInterest(keyEventsInterest?: string): void;

        resizeContent(width: number, height: number): void;
        setScaleFactorChangedHandler(handler: Function): void;

        loadSnapshot(unknown: string): void;
    }

    interface Window {
        cep: {
            fs: FS;
            process: Process;
            util: Util;
            encoding: Encoding;
        };
        cep_node: {
            Buffer: Buffer;
            global: Window;
            process: NodeJS.Process;
            require: NodeRequireFunction;
            __dirname: string;
            __filename: string;
        };
        __adobe_cep__: CEP;

        // custom
        __loadExtendScriptStart: number;
        __loadExtendScriptPromise: Promise<any>;
        __csi: CSInterface;
    }

    // webpack define
    const BUILD_MODE_DEBUG: boolean;
    const APP_VCT: string;
    const APP_VERSION: string;
    const __DEV__: boolean;
    const __TEST__: boolean;
    const __PROD__: boolean;
}
