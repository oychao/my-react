import Component from '../component/Component';
import componentFac from '../component/factory';
import { ACTION_UPDATE_PROPS, ACTION_REPLACE } from 'src/constants/index';
import VirtualNode from '../virtualDom/VirtualNode';

type TransactionWrapper = {
  before: Riact.TFunction;
  after: Riact.TFunction;
};

abstract class AppContext implements Riact.IAppContext {
  constructor() {
    this.componentDeclarationMap = new Map<
      Riact.TFuncComponent,
      typeof Component
    >();
    this.performing = false;
    this.wrappers = [AppContext.BATCHING_UPDATE_STRATEGY];
  }

  /**
   * register component declaration
   */
  private componentDeclarationMap: Map<Riact.TFuncComponent, typeof Component>;
  public getComponent(render: Riact.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render);
    } else {
      const TargetComponent: typeof Component = componentFac(render);
      this.componentDeclarationMap.set(render, TargetComponent);
      return TargetComponent;
    }
  }

  /**
   * transaction and batching update strategy
   */
  private performing: boolean;
  private readonly wrappers: Array<TransactionWrapper>;
  public perform(
    callback: Riact.TFunction,
    scope: any,
    ...args: Array<any>
  ): void {
    this.performing = true;
    this.beforeAll();
    callback.apply(scope, args);
    this.afterAll();
    this.performing = false;
  }
  private beforeAll(): void {
    for (const wrapper of this.wrappers) {
      wrapper.before.call(this);
    }
  }
  private afterAll(): void {
    for (const wrapper of this.wrappers) {
      wrapper.after.call(this);
    }
  }
  public batchingUpdate(
    callback: Riact.TFunction,
    scope: Riact.TObject,
    ...args: Array<any>
  ): any {
    const { performing }: AppContext = this;
    this.performing = true;
    if (performing) {
      return callback.apply(scope, args);
    } else {
      this.perform(callback, scope, args);
    }
  }
  private static BATCHING_UPDATE_STRATEGY: TransactionWrapper = {
    before() {},
    after() {
      // batching update
    }
  };

  /**
   * dirty components stack
   */
  private dirtyComponentQueue: Array<Component> = [];
  public pushDirtyComponent(comp: Component): void {
    this.dirtyComponentQueue.push(comp);
  }
  public popDirtyComponent(): Component {
    return this.dirtyComponentQueue.pop();
  }
  public hasDirtyComponent(): boolean {
    return this.dirtyComponentQueue.length > 0;
  }
}

export default AppContext;
