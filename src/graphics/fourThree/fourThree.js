import m from 'mithril';
import gsap from 'gsap';
import { get } from 'lodash';
import fitty from 'fitty';

import '../common.css'
import './fourThree.css';

import TimerComponent from '../timer/timer.js';
import RunnersComponent from '../runners/runners.js';
import CouchComponent from '../couch/couch.js';
import BeachBackground from '../beach/beach.js';

const replicants = {
  run: NodeCG.Replicant('runDataActiveRun', 'nodecg-speedcontrol'),
  timer: NodeCG.Replicant('timer', 'nodecg-speedcontrol'),
  total: NodeCG.Replicant('total', 'nodecg-tiltify'),
  backgroundMode: NodeCG.Replicant('backgroundMode', 'wasd'),
};

class RunGameComponent {
  view(vnode) {
    return m('.run-game', String(vnode.attrs.game));
  }

  onupdate(vnode) {
    fitty(vnode.dom, { maxSize: 45, multiline: false });
  }

  oncreate(vnode) {
    fitty(vnode.dom, { maxSize: 45, multiline: false });
  }
}

class RunDetailsComponent {
  view(vnode) {
    const system = get(vnode, 'attrs.run.system');
    const release = get(vnode, 'attrs.run.release');
    const category = get(vnode, 'attrs.run.category');
    const sep = '/';

    return  m('.run-details', `${system}  ${sep}  ${release}  ${sep}  ${category}`);
  }

  onupdate(vnode) {
    fitty(vnode.dom, { maxSize: 23, multiline: false });
  }

  oncreate(vnode) {
    fitty(vnode.dom, { maxSize: 23, multiline: false });
  }
}

class Logos {
  view() {
    return m('.logos', [
      m('.logo .wasd'),
      m('.logo .special-effect'),
    ]);
  }

  onremove(vnode) {
    if (this.anim) {
      this.anim.kill();
    }
  }

  oncreate(vnode) {
    const logos = Array.from(vnode.dom.children);

    const tl = gsap.timeline({ repeat: -1 });

    logos.forEach((logo) => {
      tl.from(logo, { opacity: 0 });
      tl.to({}, vnode.attrs.hold || 2, {});
      tl.to(logo, { opacity: 0 });
    });

    this.anim = tl;
  }
}

class FourThreeComponent {
  view(vnode) {
    return m('.graphic .overlay', [
      m(BeachBackground, { backgroundModeRep: vnode.attrs.backgroundModeRep }),
      m('.game'),
      m('.left', [
        m('.run-info', [
          m(RunGameComponent, { game: get(vnode, 'attrs.run.game') }),
          m(RunDetailsComponent, { run: get(vnode, 'attrs.run') }),
        ]),
        m('.run-spacer'),
        m('.run-timing', [
          m(TimerComponent, { time: vnode.attrs.time }),
          m('.run-estimate', `Estimate: ${get(vnode, 'attrs.run.estimate')}`),
        ]),
        m('.cam'),
        m(RunnersComponent, {
          players: get(vnode, 'attrs.run.teams[0].players'),
          customData: get(vnode, 'attrs.run.customData'),
        }),
        m(CouchComponent, { customData: get(vnode, 'attrs.run.customData') }),
        m(Logos, { hold: 22 }),
      ]),
    ]);
  }

  oncreate(vnode) {
    const rep = vnode.attrs.backgroundModeRep;

    rep.on('change', (newMode) => {
      if (newMode === 'day') {
        return;
      }

      if (newMode === 'night') {
        return;
      }
    });
  }
}

NodeCG.waitForReplicants(...Object.values(replicants)).then(() => {
  m.mount(document.body, {
    view: () => {
      return m(FourThreeComponent, {
        run: replicants.run.value,
        time: replicants.timer.value.time,
        total: Math.floor(replicants.total.value),
        backgroundModeRep: replicants.backgroundMode,
      });
    }
  });
});

Object.values(replicants).forEach((rep) => {
  rep.on('change', () => { m.redraw(); });
});
