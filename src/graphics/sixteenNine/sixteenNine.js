import m from 'mithril';
import { get } from 'lodash';

import '../common.css'
import './sixteenNine.css';

import TimerComponent from '../timer/timer.js';
import RunnersComponent from '../runners/runners.js';
import StarfallComponent from '../starfall/starfall.js';

import blankRun from '../blankRun.js';

const runRep = NodeCG.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const timerRep = NodeCG.Replicant('timer', 'nodecg-speedcontrol');
const totalRep = NodeCG.Replicant('total', 'nodecg-tiltify');

let run = null;
const updateRun = () => { run = (runRep.value || blankRun); };

const sep = '/';

class SixteenNineComponent {
  view(vnode) {
    return m('.graphic .sixteen-nine', [
      m(StarfallComponent),
      m('.game'),
      m('.left', [
        m('.cam'),
        m(RunnersComponent, {
          players: get(vnode, 'attrs.run.teams[0].players'),
          customData: get(vnode, 'attrs.run.customData'),
        }),
        m('.left-info', [
          m('.special-effect-logo'),
          //m('.x', 'X'),
          m('.wasd-logo'),
          m('.total', `£${vnode.attrs.total}`),
        ]),
      ]),
      m('.bottom',[
        m('.run-details', [
          m('.run-game', String(get(vnode, 'attrs.run.game'))),
          m('.run-details-row', [
            m('div', String(get(vnode, 'attrs.run.system'))),
            m('div', sep),
            m('div', String(get(vnode, 'attrs.run.release'))),
            m('div', sep),
            m('div', String(get(vnode, 'attrs.run.category'))),
          ]),
        ]),
        m('.run-timing', [
          m(TimerComponent, { time: vnode.attrs.time }),
          m('.estimate', `Estimate: ${get(vnode, 'attrs.run.estimate')}`),
        ]),
      ]),
    ]);
  }
}


NodeCG.waitForReplicants(runRep, timerRep, totalRep).then(() => {
  m.mount(document.body, {
    view: () => {
      return m(SixteenNineComponent, {
        run: runRep.value,
        time: timerRep.value.time,
        total: Math.floor(totalRep.value),
      });
    }
  });
});

runRep.on('change', () => { updateRun(); m.redraw(); });
timerRep.on('change', () => { m.redraw(); });
totalRep.on('change', () => { m.redraw(); });
