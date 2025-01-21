import { _decorator, Component, EventTouch, instantiate, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Move')
export class Move extends Component {
    @property(Vec2)
    public minBoundary: Vec2 = new Vec2(0, 0);
    @property(Vec2)
    public maxBoundary: Vec2 = new Vec2(0, 0);
    @property(Prefab)
    FutureWorkLabel: Prefab = null;
    @property(Node)
    restartPanel: Node = null;
    private _offset: Vec3 = new Vec3();
    private _isDragging: boolean = false;

    onLoad() {
        // 注册触摸事件
        this.addTouch();
    }
    protected start(): void {
        this.scheduleOnce(() => {
            this.removeTouch();
            let FutureWorkLabel = instantiate(this.FutureWorkLabel);
            FutureWorkLabel.setParent(this.node);
            let t1 = tween(FutureWorkLabel)
                .to(1.5, { position: new Vec3(0, 95, 0) }, { easing: 'backInOut' });

            let t2 = tween(this.node)
                .to(2, { position: new Vec3(0, 170, 0) });

            t1.call(() => {
                t2.start();
                this.scheduleOnce(() => {
                    this.restartPanel.active = true;
                },2)
            }).start();
        }, GameManager.Instance.totalTime);
    }
    onDestroy() {
        // 移除触摸事件
        this.removeTouch()
    }
    onTouchStart(event: EventTouch) {
        //触摸位置
        const touchLocation = event.getUILocation();
        //结点位置
        const nodeLocation = this.node.getPosition();
        //计算位置偏移量
        this._offset.set(touchLocation.x - nodeLocation.x, touchLocation.y - nodeLocation.y, 0);
        this._isDragging = true;
    }

    onTouchMove(event: EventTouch) {
        if (!this._isDragging) return;
        const touchLocation = event.getUILocation();
        let newPosition = new Vec3(touchLocation.x - this._offset.x, touchLocation.y - this._offset.y, this.node.getPosition().z);
        // 限定拖动范围
        newPosition = this.clampPosition(newPosition);
        this.node.setPosition(newPosition);
    }

    onTouchEnd(event: EventTouch) {
        this._isDragging = false;
    }

    clampPosition(position: Vec3): Vec3 {
        // 将位置x限制在最小边界和最大边界之间
        const clampedX = Math.max(this.minBoundary.x, Math.min(position.x, this.maxBoundary.x));
        // 将位置y限制在最小边界和最大边界之间
        const clampedY = Math.max(this.minBoundary.y, Math.min(position.y, this.maxBoundary.y));
        // 返回新的Vec3对象，其中x和y被限制在边界内，z保持不变
        return new Vec3(clampedX, clampedY, position.z);
    }
    addTouch() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    removeTouch() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}


