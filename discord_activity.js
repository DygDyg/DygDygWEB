(() => {
    /* ================= GLOBAL STATE ================= */

    window.DiscordActivity ??= {
        running: false,
        cleanups: [],
        ui: null,
        fakeGame: null,
        realGetRunningGames: null,
        realGetGameForPID: null
    };

    const State = window.DiscordActivity;

    /* ================= WEBPACK ================= */

    if (!window.wpRequire) {
        window.wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
        webpackChunkdiscord_app.pop();
    }

    const wpRequire = window.wpRequire;

    /* ================= STORES ================= */

    const RunningGameStore = Object.values(wpRequire.c)
        .find(x => x?.exports?.ZP?.getRunningGames)?.exports.ZP;

    const QuestsStore = Object.values(wpRequire.c)
        .find(x => x?.exports?.Z?.__proto__?.getQuest)?.exports.Z;

    const FluxDispatcher = Object.values(wpRequire.c)
        .find(x => x?.exports?.Z?.__proto__?.flushWaitQueue)?.exports.Z;

    const api = Object.values(wpRequire.c)
        .find(x => x?.exports?.tn?.get)?.exports.tn;

    /* ================= STOP ================= */

    function stop() {
        if (!State.running) return;

        console.log("[DiscordActivity] stopping…");

        // отписки
        for (const fn of State.cleanups) {
            try { fn(); } catch {}
        }
        State.cleanups = [];

        // восстановление RunningGameStore
        if (State.realGetRunningGames) {
            RunningGameStore.getRunningGames = State.realGetRunningGames;
            RunningGameStore.getGameForPID = State.realGetGameForPID;
        }

        // сброс overlay
        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: State.fakeGame ? [State.fakeGame] : [],
            added: [],
            games: []
        });

        State.fakeGame = null;
        State.running = false;

        console.log("[DiscordActivity] stopped");
    }

    /* ================= START ================= */

    function start() {
        if (State.running) {
            console.warn("[DiscordActivity] already running");
            return;
        }

        State.running = true;
        State.cleanups = [];

        console.log("[DiscordActivity] started");

        const quest = [...QuestsStore.quests.values()].find(q =>
            q.userStatus?.enrolledAt &&
            !q.userStatus?.completedAt &&
            new Date(q.config.expiresAt).getTime() > Date.now()
        );

        if (!quest) {
            console.log("No active quests");
            return;
        }

        const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
        const taskName = Object.keys(taskConfig.tasks)[0];

        if (taskName !== "PLAY_ON_DESKTOP") {
            console.log("Only PLAY_ON_DESKTOP implemented safely");
            return;
        }

        if (typeof DiscordNative === "undefined") {
            console.log("Desktop app required");
            return;
        }

        const applicationId = quest.config.application.id;
        const pid = Math.floor(Math.random() * 30000) + 1000;

        api.get({ url: `/applications/public?application_ids=${applicationId}` })
            .then(res => {
                const app = res.body[0];
                const exeName = app.executables.find(x => x.os === "win32").name.replace(">", "");

                /* ===== FULL FAKE GAME (OVERLAY SAFE) ===== */

                const fakeGame = {
                    cmdLine: `C:\\Program Files\\${app.name}\\${exeName}`,
                    exeName,
                    exePath: `c:/program files/${app.name.toLowerCase()}/${exeName.toLowerCase()}`,
                    hidden: false,
                    isLauncher: false,
                    id: applicationId,
                    name: app.name,
                    pid,
                    pidPath: [pid],
                    processName: app.name,
                    start: Date.now(),
                };

                State.fakeGame = fakeGame;

                // сохраняем оригиналы
                State.realGetRunningGames = RunningGameStore.getRunningGames;
                State.realGetGameForPID = RunningGameStore.getGameForPID;

                RunningGameStore.getRunningGames = () => [fakeGame];
                RunningGameStore.getGameForPID = pid => fakeGame;

                State.cleanups.push(() => {
                    RunningGameStore.getRunningGames = State.realGetRunningGames;
                    RunningGameStore.getGameForPID = State.realGetGameForPID;
                });

                FluxDispatcher.dispatch({
                    type: "RUNNING_GAMES_CHANGE",
                    removed: [],
                    added: [fakeGame],
                    games: [fakeGame]
                });

                const secondsNeeded = taskConfig.tasks.PLAY_ON_DESKTOP.target;

                const fn = data => {
                    const progress = Math.floor(
                        data.userStatus.progress.PLAY_ON_DESKTOP.value
                    );

                    console.log(`Progress: ${progress}/${secondsNeeded}`);

                    if (progress >= secondsNeeded) {
                        console.log("Quest completed");
                        stop();
                    }
                };

                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                State.cleanups.push(() =>
                    FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn)
                );
            });
    }

    /* ================= UI ================= */

    function createUI() {
        if (State.ui) return;

        const btn = document.createElement("button");
        btn.textContent = "↻ Restart activity";
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: #5865f2;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            cursor: pointer;
        `;

        btn.onclick = () => {
            stop();
            setTimeout(start, 200);
        };

        document.body.appendChild(btn);
        State.ui = btn;
    }

    /* ================= EXPOSE ================= */

    window.startDiscordActivity = start;
    window.stopDiscordActivity = stop;
    window.restartDiscordActivity = () => {
        stop();
        setTimeout(start, 200);
    };

    createUI();
    start();
})();
