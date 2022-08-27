// !: 置顶是为了处理 logger.ts 和 CSInterface/index.ts 循环引用的问题
// ts-import-sorter: disable
import './utils/logger';
// ts-import-sorter: disable
import './utils/events';

import { enableAllPlugins } from 'immer';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';

import Home from 'pages/home';
import { RoutePath } from 'utils/constants';

import AppContainer from './containers/AppContainer';
import { KeyBar } from './containers/keyBar';
import { store } from './store';

import './utils/CSInterface/index';
import './utils/shortcuts';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import './index.less';

function App() {
    return (
        <KeyBar>
            <Provider store={store}>
                <AppContainer>
                    <HashRouter>
                        <Routes>
                            <Route index element={<Home />} />
                            <Route path={RoutePath.Home} element={<Home />} />
                        </Routes>
                    </HashRouter>
                </AppContainer>
            </Provider>
        </KeyBar>
    );
}

enableAllPlugins();
const container = document.querySelector('#root');
const root = createRoot(container!);
root.render(<App />);
