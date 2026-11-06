import { a as e, n as t, o as n, t as r } from './jsx-runtime-MpOfvRDf.js';
import { i, n as a, r as o } from './wayfinder-XeZxejp2.js';
import {
    F as s,
    N as c,
    O as l,
    P as u,
    _ as d,
    v as f,
} from './dist-C2Km1XPK.js';
import { t as p } from './utils-BHD7Ue36.js';
import { t as m } from './check-CIGvwnhF.js';
import { c as h, d as g, p as _, u as v } from './app-ByPPPRJa.js';
import { t as y } from './input-error-DOAS4LL_.js';
import { t as b } from './password-input-DH4SJM0e.js';
import { t as x } from './label-BRz5AiYd.js';
import { t as S } from './spinner-ChtUroFk.js';
import { t as C } from './passkey-verify-CFKHLgqT.js';
import { t as w } from './text-link-BWBBh2wo.js';
import { n as T } from './password-bKXFvvc0.js';
var E = t(),
    D = n(e(), 1),
    O = r(),
    k = Object.defineProperty,
    A = (e, t) => k(e, `name`, { value: t, configurable: !0 }),
    j = `Checkbox`,
    [M, N] = c(j),
    [P, F] = M(j);
function I(e) {
    let {
            __scopeCheckbox: t,
            checked: n,
            children: r,
            defaultChecked: i,
            disabled: a,
            form: o,
            name: s,
            onCheckedChange: c,
            required: l,
            value: u = `on`,
            internal_do_not_use_render: f,
        } = e,
        [p, m] = d({ prop: n, defaultProp: i ?? !1, onChange: c, caller: j }),
        [h, g] = D.useState(null),
        [_, v] = D.useState(null),
        [y, b] = D.useState(null),
        x = !h || !!o || !!h.closest(`form`),
        S = {
            checked: p,
            disabled: a,
            setChecked: m,
            control: h,
            setControl: g,
            name: s,
            form: o,
            value: u,
            userClick: y,
            onUserClick: b,
            required: l,
            defaultChecked: !G(i) && i,
            isFormControl: x,
            bubbleInput: _,
            setBubbleInput: v,
        };
    return (0, O.jsx)(P, { scope: t, ...S, children: W(f) ? f(S) : r });
}
A(I, `CheckboxProvider`);
var L = `CheckboxTrigger`,
    R = D.forwardRef(
        A(function ({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...r }, i) {
            let {
                    control: a,
                    value: o,
                    disabled: c,
                    checked: d,
                    required: f,
                    setControl: p,
                    setChecked: m,
                    onUserClick: h,
                    isFormControl: g,
                    bubbleInput: _,
                } = F(L, e),
                v = u(i, p),
                y = D.useRef(d);
            return (
                D.useEffect(() => {
                    let e = a?.form;
                    if (e) {
                        let t = A(() => m(y.current), `reset`);
                        return (
                            e.addEventListener(`reset`, t),
                            () => e.removeEventListener(`reset`, t)
                        );
                    }
                }, [a, m]),
                (0, O.jsx)(l.button, {
                    type: `button`,
                    role: `checkbox`,
                    'aria-checked': G(d) ? `mixed` : d,
                    'aria-required': f,
                    'data-state': K(d),
                    'data-disabled': c ? `` : void 0,
                    disabled: c,
                    value: o,
                    ...r,
                    ref: v,
                    onKeyDown: s(t, (e) => {
                        e.key === `Enter` && e.preventDefault();
                    }),
                    onClick: s(n, (e) => {
                        let t = e.isPropagationStopped();
                        (h({
                            requestedChecked: G(d) ? !0 : !d,
                            hasConsumerStoppedPropagation: t,
                        }),
                            m((e) => (G(e) ? !0 : !e)),
                            _ && g && (t || e.stopPropagation()));
                    }),
                })
            );
        }, `CheckboxTrigger`),
    ),
    z = D.forwardRef(
        A(function (e, t) {
            let {
                __scopeCheckbox: n,
                name: r,
                checked: i,
                defaultChecked: a,
                required: o,
                disabled: s,
                value: c,
                onCheckedChange: l,
                form: u,
                ...d
            } = e;
            return (0, O.jsx)(I, {
                __scopeCheckbox: n,
                checked: i,
                defaultChecked: a,
                disabled: s,
                required: o,
                onCheckedChange: l,
                name: r,
                form: u,
                value: c,
                internal_do_not_use_render: ({ isFormControl: e }) =>
                    (0, O.jsxs)(O.Fragment, {
                        children: [
                            (0, O.jsx)(R, { ...d, ref: t, __scopeCheckbox: n }),
                            e && (0, O.jsx)(U, { __scopeCheckbox: n }),
                        ],
                    }),
            });
        }, `Checkbox`),
    ),
    B = `CheckboxIndicator`,
    V = D.forwardRef(
        A(function (e, t) {
            let { __scopeCheckbox: n, forceMount: r, ...i } = e,
                a = F(B, n);
            return (0, O.jsx)(f, {
                present: r || G(a.checked) || a.checked === !0,
                children: (0, O.jsx)(l.span, {
                    'data-state': K(a.checked),
                    'data-disabled': a.disabled ? `` : void 0,
                    ...i,
                    ref: t,
                    style: { pointerEvents: `none`, ...e.style },
                }),
            });
        }, `CheckboxIndicator`),
    ),
    H = `CheckboxBubbleInput`,
    U = D.forwardRef(
        A(function ({ __scopeCheckbox: e, onClick: t, ...n }, r) {
            let {
                    control: i,
                    userClick: a,
                    checked: o,
                    defaultChecked: c,
                    required: d,
                    disabled: f,
                    name: p,
                    value: m,
                    form: h,
                    bubbleInput: g,
                    setBubbleInput: v,
                } = F(H, e),
                y = u(r, v),
                b = _(i),
                x = D.useRef(!1),
                S = D.useRef(o),
                C = D.useRef(a),
                w = D.useRef(null);
            D.useEffect(() => {
                let e = g;
                if (!e) return;
                let t = window.HTMLInputElement.prototype,
                    n = Object.getOwnPropertyDescriptor(t, `checked`).set;
                if (!n) return;
                let r = S.current !== o;
                S.current = o;
                let i = a !== null && a !== C.current;
                if (((C.current = a), i))
                    ((w.current = r ? null : a),
                        r && ((e.indeterminate = G(o)), n.call(e, !G(o) && o)),
                        e.dispatchEvent(
                            new Event(`click`, {
                                bubbles: !a.hasConsumerStoppedPropagation,
                            }),
                        ));
                else if (r) {
                    let t = w.current;
                    w.current = null;
                    let r = t?.requestedChecked === o;
                    ((x.current = !0),
                        (e.indeterminate = G(o)),
                        n.call(e, !G(o) && o),
                        e.dispatchEvent(
                            new Event(`click`, {
                                bubbles: !(
                                    r && t.hasConsumerStoppedPropagation
                                ),
                            }),
                        ),
                        (x.current = !1));
                }
            }, [g, o, a]);
            let T = D.useRef(!G(o) && o);
            return (0, O.jsx)(l.input, {
                type: `checkbox`,
                'aria-hidden': !0,
                defaultChecked: c ?? T.current,
                required: d,
                disabled: f,
                name: p,
                value: m,
                form: h,
                ...n,
                tabIndex: -1,
                ref: y,
                onClick: s(t, (e) => {
                    x.current && e.stopPropagation();
                }),
                style: {
                    ...n.style,
                    ...b,
                    position: `absolute`,
                    pointerEvents: `none`,
                    opacity: 0,
                    margin: 0,
                    transform: `translateX(-100%)`,
                },
            });
        }, `CheckboxBubbleInput`),
    );
function W(e) {
    return typeof e == `function`;
}
A(W, `isFunction`);
function G(e) {
    return e === `indeterminate`;
}
A(G, `isIndeterminate`);
function K(e) {
    return G(e) ? `indeterminate` : e ? `checked` : `unchecked`;
}
A(K, `getState`);
function q(e) {
    let t = (0, E.c)(9),
        n,
        r;
    t[0] === e
        ? ((n = t[1]), (r = t[2]))
        : (({ className: n, ...r } = e), (t[0] = e), (t[1] = n), (t[2] = r));
    let i;
    t[3] === n
        ? (i = t[4])
        : ((i = p(
              `peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50`,
              n,
          )),
          (t[3] = n),
          (t[4] = i));
    let a;
    t[5] === Symbol.for(`react.memo_cache_sentinel`)
        ? ((a = (0, O.jsx)(V, {
              'data-slot': `checkbox-indicator`,
              className: `flex items-center justify-center text-current transition-none`,
              children: (0, O.jsx)(m, { className: `size-3.5` }),
          })),
          (t[5] = a))
        : (a = t[5]);
    let o;
    return (
        t[6] !== r || t[7] !== i
            ? ((o = (0, O.jsx)(z, {
                  'data-slot': `checkbox`,
                  className: i,
                  ...r,
                  children: a,
              })),
              (t[6] = r),
              (t[7] = i),
              (t[8] = o))
            : (o = t[8]),
        o
    );
}
var J = (e) => ({ url: J.url(e), method: `post` });
((J.definition = { methods: [`post`], url: `/login` }),
    (J.url = (e) => J.definition.url + a(e)),
    (J.post = (e) => ({ url: J.url(e), method: `post` })));
var Y = (e) => ({ action: J.url(e), method: `post` });
((Y.post = (e) => ({ action: J.url(e), method: `post` })),
    (J.form = Y),
    Object.assign(J, J));
function X(e) {
    let t = (0, E.c)(11),
        { status: n, canResetPassword: r } = e,
        a,
        s;
    t[0] === Symbol.for(`react.memo_cache_sentinel`)
        ? ((a = (0, O.jsx)(i, { title: `Log in` })),
          (s = (0, O.jsx)(C, {})),
          (t[0] = a),
          (t[1] = s))
        : ((a = t[0]), (s = t[1]));
    let c, l;
    t[2] === Symbol.for(`react.memo_cache_sentinel`)
        ? ((c = J.form()), (l = [`password`]), (t[2] = c), (t[3] = l))
        : ((c = t[2]), (l = t[3]));
    let u;
    t[4] === r
        ? (u = t[5])
        : ((u = (0, O.jsx)(o, {
              ...c,
              resetOnSuccess: l,
              className: `flex flex-col gap-6`,
              children: (e) => {
                  let { processing: t, errors: n } = e;
                  return (0, O.jsxs)(O.Fragment, {
                      children: [
                          (0, O.jsxs)(`div`, {
                              className: `grid gap-6`,
                              children: [
                                  (0, O.jsxs)(`div`, {
                                      className: `grid gap-2`,
                                      children: [
                                          (0, O.jsx)(x, {
                                              htmlFor: `email`,
                                              children: `Email address`,
                                          }),
                                          (0, O.jsx)(v, {
                                              id: `email`,
                                              type: `email`,
                                              name: `email`,
                                              required: !0,
                                              autoFocus: !0,
                                              tabIndex: 1,
                                              autoComplete: `email`,
                                              placeholder: `email@example.com`,
                                          }),
                                          (0, O.jsx)(y, { message: n.email }),
                                      ],
                                  }),
                                  (0, O.jsxs)(`div`, {
                                      className: `grid gap-2`,
                                      children: [
                                          (0, O.jsxs)(`div`, {
                                              className: `flex items-center`,
                                              children: [
                                                  (0, O.jsx)(x, {
                                                      htmlFor: `password`,
                                                      children: `Password`,
                                                  }),
                                                  r &&
                                                      (0, O.jsx)(w, {
                                                          href: T(),
                                                          className: `ml-auto text-sm`,
                                                          tabIndex: 5,
                                                          children: `Forgot your password?`,
                                                      }),
                                              ],
                                          }),
                                          (0, O.jsx)(b, {
                                              id: `password`,
                                              name: `password`,
                                              required: !0,
                                              tabIndex: 2,
                                              autoComplete: `current-password`,
                                              placeholder: `Password`,
                                          }),
                                          (0, O.jsx)(y, {
                                              message: n.password,
                                          }),
                                      ],
                                  }),
                                  (0, O.jsxs)(`div`, {
                                      className: `flex items-center space-x-3`,
                                      children: [
                                          (0, O.jsx)(q, {
                                              id: `remember`,
                                              name: `remember`,
                                              tabIndex: 3,
                                          }),
                                          (0, O.jsx)(x, {
                                              htmlFor: `remember`,
                                              children: `Remember me`,
                                          }),
                                      ],
                                  }),
                                  (0, O.jsxs)(g, {
                                      type: `submit`,
                                      className: `mt-4 w-full`,
                                      tabIndex: 4,
                                      disabled: t,
                                      'data-test': `login-button`,
                                      children: [
                                          t && (0, O.jsx)(S, {}),
                                          `Log in`,
                                      ],
                                  }),
                              ],
                          }),
                          (0, O.jsxs)(`div`, {
                              className: `text-center text-sm text-muted-foreground`,
                              children: [
                                  `Don't have an account?`,
                                  ` `,
                                  (0, O.jsx)(w, {
                                      href: h(),
                                      tabIndex: 5,
                                      children: `Sign up`,
                                  }),
                              ],
                          }),
                      ],
                  });
              },
          })),
          (t[4] = r),
          (t[5] = u));
    let d;
    t[6] === n
        ? (d = t[7])
        : ((d =
              n &&
              (0, O.jsx)(`div`, {
                  className: `mb-4 text-center text-sm font-medium text-green-600`,
                  children: n,
              })),
          (t[6] = n),
          (t[7] = d));
    let f;
    return (
        t[8] !== u || t[9] !== d
            ? ((f = (0, O.jsxs)(O.Fragment, { children: [a, s, u, d] })),
              (t[8] = u),
              (t[9] = d),
              (t[10] = f))
            : (f = t[10]),
        f
    );
}
X.layout = {
    title: `Log in to your account`,
    description: `Enter your email and password below to log in`,
};
export { X as default };
