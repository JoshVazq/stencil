import { Component, Prop } from '../../../../dist/index';

@Component({
  tag: 'slot-replace-wrapper'
})
export class SlotReplaceWrapper {

  @Prop() href: string = null;

  render() {
    const TagType = (this.href != null ? 'a' : 'div');
    const attrs = (this.href != null ? { href: this.href, target: '_blank' } : {}) as any;

    return [
      <TagType {...attrs}>
        <slot name='start'/>
        <span>
          <slot/>
          <span>
            <slot name='end'/>
          </span>
        </span>
      </TagType>,
      <hr/>
    ];
  }

}
