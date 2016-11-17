import invariant from 'invariant';

export const START_TIMER = 'START_TIMER';
export const STOP_TIMER = 'STOP_TIMER';

const provideMessage = field => `You should provide ${field}`;

export default function timerMiddleware({dispatch}) {
    const timers = {};

    const clearTimerWithEnd = (timerName) => {
        const timer = timers[timerName];
        if (timer) {
            clearInterval(timer.interval);
            dispatch({type: `${timer.actionName}_END`});
        }
    };

    return next => action => {
        if (action.type === START_TIMER) {
            const {
                timerName, // timer name - need for search in timers obj
                actionName, // action name that will be dispatched each timer Interval
                timerPeriod, // how many times should work timer
                timerInterval = 1000, // timer interval, default - 1s
            } = action.payload;

            invariant(actionName, provideMessage('actionName'));
            invariant(timerName, provideMessage('timerName'));

            // if we start timer that already started
            if (timers[timerName]) {
                clearInterval(timers[timerName].interval);
            }
            // clear
            timers[timerName] = {};
            const current = timers[timerName];

            // set action name
            current.actionName = actionName;

            // if timer period provided
            if (timerPeriod) {
                current.period = timerPeriod;
                current.interval = setInterval(() => {
                    current.period -= 1;
                    if (current.period === 0) {
                        clearInterval(current.interval);
                        // last tick and then end
                        dispatch({type: actionName});
                        // dispatch end action
                        dispatch({type: `${actionName}_END`});
                    } else {
                        dispatch({type: actionName});
                    }
                }, timerInterval);
            } else { // endless timer - we should stop by hand
                timers[timerName].interval = setInterval(() => {
                    dispatch({type: actionName});
                }, timerInterval);
            }
        } else if (action.type === STOP_TIMER) {
            const {timerName, timerNames = []} = action.payload;
            timerNames.forEach(item => clearTimerWithEnd(item));
            clearTimerWithEnd(timerName);
        } else {
            return next(action);
        }
    };
}
