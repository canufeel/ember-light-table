import Ember from 'ember';
import layout from '../templates/components/lt-infinity';
import InViewportMixin from 'ember-in-viewport';

const {
  Component,
  observer,
  run
} = Ember;

export default Component.extend(InViewportMixin, {
  classNames: ['lt-infinity'],
  classNameBindings: ['viewportEntered:in-viewport'],
  layout,

  rows: null,
  scrollBuffer: null,

  didInsertElement() {
    this._super(...arguments);

    let scrollBuffer = this.get('scrollBuffer');
    let width = this.$().width();

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        left: width,
        right: width,
        bottom: scrollBuffer,
        top: 0
      }
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this._cancelTimers();
  },

  didEnterViewport() {
    this._debounceScrolledTo();
  },

  didExitViewport() {
    this._cancelTimers();
  },

  scheduleScrolledTo: observer('rows.[]', 'viewportEntered', function() {
    if (this.get('viewportEntered')) {
      /*
        Continue scheduling onScrolledToBottom until no longer in viewport
       */
      this._scheduleScrolledTo();
    }
  }),

  _scheduleScrolledTo() {
    this._schedulerTimer = run.scheduleOnce('afterRender', this, this._debounceScrolledTo);
  },

  _debounceScrolledTo(delay = 100) {
    /*
      This debounce is needed when there is not enough delay between onScrolledToBottom calls.
      Without this debounce, all rows will be rendered causing immense performance problems
     */
    const action = this.get('onScrolledToTop') ? 'onScrolledToTop' : 'onScrolledToBottom';
    this._debounceTimer = run.debounce(this, this.sendAction, action, delay);
  },

  _cancelTimers() {
    run.cancel(this._schedulerTimer);
    run.cancel(this._debounceTimer);
  }
});
