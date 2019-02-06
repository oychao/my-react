import * as _ from '../../utils/index';
import Context from '../context/Context';
import VirtualNode from '../virtualDom/VirtualNode';
import StaticContext from '../context/StaticContext';

export default class Component implements common.IComponent {
  private readonly stateHooks: Array<any>;
  private initialized: boolean;
  private stateHookIndex: number;
  
  constructor(context: Context, virtualNode: VirtualNode) {
    this.context = context;
    this.stateHooks = [];
    this.initialized = false;
    this.virtualNode = virtualNode;
    this.virtualNode.children[0] = VirtualNode.createEmptyNode();
    this.virtualNode.children[0].parentNode = this.virtualNode;
    this.virtualNode.el = this;
    if (this.beforeInitialize) {
      this.beforeInitialize();
    }
    this.update(null);
    this.initialized = true;
  }
  
  protected beforeInitialize(): void {}
  protected shouldComponentUpdate(prevProps: common.TObject): boolean {
    return true;
  }
  
  public update(prevProps: common.TObject): void {
    if (!this.shouldComponentUpdate(prevProps)) {
      return;
    }
    StaticContext.setCurrentInstance(this);
    this.stateHookIndex = 0;
    const newVirtualDom: VirtualNode = this.render(this.virtualNode.attributes) as VirtualNode;
    // mount sub virtual dom tree to global virtual dom tree
    newVirtualDom.parentNode = this.virtualNode;
    VirtualNode.diffTree(this.virtualNode.children[0], newVirtualDom);
    this.virtualNode.children[0].reconcile();
    StaticContext.clearCurrentInstance();
  }
  
  public useStateHook<T>(state: T): [ T, (newState: T) => void ] {
    let stateValue: T = state;
    const { stateHooks, stateHookIndex, initialized }: Component = this;
    if (initialized) {
      stateValue = stateHooks[stateHookIndex];
    } else {
      stateHooks.push(state);
    }
    this.stateHookIndex++;
    return [ stateValue, (newState: T): void => {
      if (_.isNull(this.virtualNode)) {
        return;
      }
      Promise.resolve().then(() => {
        stateHooks[stateHookIndex] = newState;
        this.update(null);
        this.virtualNode.children[0].reconcile();
      });
    } ];
  }
  
  public unmount() {
    this.virtualNode = null;
  }
  
  public virtualNode: VirtualNode;
  public readonly context: Context;
  public readonly render: common.TFuncComponent;
  public getContext(): Context {
    return this.context;
  }
}
