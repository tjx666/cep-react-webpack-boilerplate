import csInterface from './CSInterface';

// 定义 CMD + R 刷新页面快捷键
const keyEventsInterest = [
    // PS 默认 cmd + r 是显示 ruler
    {
        metaKey: true,
        keyCode: 15,
    },
    {
        metaKey: true,
        keyCode: 15,
    },
    // 再配置一套带 shift 键是为了在没有移除默认快捷键的情况下也能用
    {
        metaKey: true,
        shiftKey: true,
        keyCode: 15,
    },
    {
        metaKey: true,
        shiftKey: true,
        keyCode: 15,
    },
    {
        metaKey: true,
        shiftKey: true,
        keyCode: 35,
    },
    {
        ctrlKey: true,
        shiftKey: true,
        keyCode: 35,
    },
];
csInterface.registerKeyEventsInterest(JSON.stringify(keyEventsInterest));

window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        window.location.reload();
    }
});
