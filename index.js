const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const mysql = require('mysql2/promise');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    devtools = new BrowserWindow();

    win.loadFile('index.html')
    // 打开开发者工具
    win.webContents.setDevToolsWebContents(devtools.webContents)
    win.webContents.openDevTools({ mode: 'detach' })
    console.log("open dev tool")
}

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost', // MySQL 服务器地址
            user: 'root', // 用户名
            password: 'mysqlmysql', // 密码
            database: 'hippo' // 数据库名
        });

        console.log('Connected to the database.');

        // 执行查询
        [rows, fields] = await connection.execute('SELECT * FROM my_test');
        //console.log(rows);

        // 关闭连接
        await connection.end();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}


// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady().then(() => {
    createWindow()

    // 调用函数来连接数据库
    connectToDatabase();
    ipcMain.handle('ping', () => 'pong')

    // 在macOS上，当单击dock图标并且没有其他窗口打开时， 
    // 通常在应用程序中重新创建一个窗口。 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})