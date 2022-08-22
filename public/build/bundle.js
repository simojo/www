
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (katex) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var katex__default = /*#__PURE__*/_interopDefaultLegacy(katex);

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, hrefVar || node.getAttribute('href'));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != '/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute('href', '#' + href);

    	node.addEventListener('click', scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute('href');

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument');
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix) {
    				if (typeof prefix == 'string' && path.startsWith(prefix)) {
    					path = path.substr(prefix.length) || '/';
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener('popstate', event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Postcard.svelte generated by Svelte v3.49.0 */
    const file = "src/Postcard.svelte";

    // (28:0) {#if postobj.title !== undefined}
    function create_if_block$1(ctx) {
    	let a;
    	let span;
    	let t0_value = /*postobj*/ ctx[0].date + "";
    	let t0;
    	let t1;
    	let h2;
    	let t2_value = /*postobj*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*postobj*/ ctx[0].subtitle + "";
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			attr_dev(span, "class", "date svelte-xwsgcg");
    			add_location(span, file, 31, 4, 623);
    			attr_dev(h2, "class", "svelte-xwsgcg");
    			add_location(h2, file, 32, 4, 668);
    			add_location(p, file, 33, 4, 697);
    			attr_dev(a, "class", "postcard svelte-xwsgcg");
    			add_location(a, file, 28, 2, 537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(a, t1);
    			append_dev(a, h2);
    			append_dev(h2, t2);
    			append_dev(a, t3);
    			append_dev(a, p);
    			append_dev(p, t4);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*postobj*/ 1 && t0_value !== (t0_value = /*postobj*/ ctx[0].date + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*postobj*/ 1 && t2_value !== (t2_value = /*postobj*/ ctx[0].title + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*postobj*/ 1 && t4_value !== (t4_value = /*postobj*/ ctx[0].subtitle + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:0) {#if postobj.title !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*postobj*/ ctx[0].title !== undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*postobj*/ ctx[0].title !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Postcard', slots, []);
    	let { postobj = undefined } = $$props;
    	const writable_props = ['postobj'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Postcard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		push(`/posts/${postobj.postid}`);
    	};

    	$$self.$$set = $$props => {
    		if ('postobj' in $$props) $$invalidate(0, postobj = $$props.postobj);
    	};

    	$$self.$capture_state = () => ({ push, postobj });

    	$$self.$inject_state = $$props => {
    		if ('postobj' in $$props) $$invalidate(0, postobj = $$props.postobj);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postobj, click_handler];
    }

    class Postcard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { postobj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Postcard",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get postobj() {
    		throw new Error("<Postcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set postobj(value) {
    		throw new Error("<Postcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Home.svelte generated by Svelte v3.49.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (47:0) {#each postObjs as postObj}
    function create_each_block(ctx) {
    	let postcard;
    	let current;

    	postcard = new Postcard({
    			props: { postobj: /*postObj*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(postcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(postcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const postcard_changes = {};
    			if (dirty & /*postObjs*/ 1) postcard_changes.postobj = /*postObj*/ ctx[5];
    			postcard.$set(postcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(postcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(postcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(postcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(47:0) {#each postObjs as postObj}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h1;
    	let t;
    	let div;
    	let current;
    	let each_value = /*postObjs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1hh6hsb");
    			add_location(h1, file$1, 43, 0, 1187);
    			attr_dev(div, "class", "post-grid svelte-1hh6hsb");
    			add_location(div, file$1, 45, 0, 1198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postObjs*/ 1) {
    				each_value = /*postObjs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let postUrls = [];
    	let postTexts = [];
    	let postObjs = [];

    	async function parseIntoPostObj(s) {
    		let text = "";
    		await fetch(s.download_url).then(x => x.text()).then(x => text = x).catch(x => console.error(x));

    		let ret = {
    			postid: s.name.match(/.*(?=\.md)/g)[0],
    			title: text.split("\n")[0].match(/(?<=# ).*/g)[0],
    			subtitle: text.split("\n")[1].match(/(?<=## ).*/g)[0],
    			date: text.split("\n")[2].match(/(?<=### ).*/g)[0],
    			text: text.split("\n").slice(3)
    		};

    		console.log(ret);
    		$$invalidate(0, postObjs = [...postObjs, ret]);
    	}

    	async function loadData() {

    		await fetch(`https://api.github.com/repos/simojo/www/contents/posts?ref=dev-svelte`, {
    			accept: "application/vnd.github.v3.raw+json"
    		}).then(x => x.json()).then(x => x.forEach(y => parseIntoPostObj(y))).catch(error => console.error(error));
    	}

    	loadData();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Postcard,
    		postUrls,
    		postTexts,
    		postObjs,
    		parseIntoPostObj,
    		loadData
    	});

    	$$self.$inject_state = $$props => {
    		if ('postUrls' in $$props) postUrls = $$props.postUrls;
    		if ('postTexts' in $$props) postTexts = $$props.postTexts;
    		if ('postObjs' in $$props) $$invalidate(0, postObjs = $$props.postObjs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postObjs];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */
    !function(e,t){t(exports);}(commonjsGlobal,function(r){function i(e,t){for(var u=0;u<t.length;u++){var n=t[u];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var u=0,n=new Array(t);u<t;u++)n[u]=e[u];return n}function B(e,t){var u,n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(n)return (n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return s(e,t);var u=Object.prototype.toString.call(e).slice(8,-1);return "Map"===(u="Object"===u&&e.constructor?e.constructor.name:u)||"Set"===u?Array.from(e):"Arguments"===u||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(u)?s(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length)return n&&(e=n),u=0,function(){return u>=e.length?{done:!0}:{done:!1,value:e[u++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function e(){return {baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartLists:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}r.defaults=e();function u(e){return t[e]}var n=/[&<>"']/,l=/[&<>"']/g,a=/[<>"']|&(?!#?\w+;)/,o=/[<>"']|&(?!#?\w+;)/g,t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function D(e,t){if(t){if(n.test(e))return e.replace(l,u)}else if(a.test(e))return e.replace(o,u);return e}var c=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function x(e){return e.replace(c,function(e,t){return "colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}var h=/(^|[^\[])\^/g;function p(u,e){u="string"==typeof u?u:u.source,e=e||"";var n={replace:function(e,t){return t=(t=t.source||t).replace(h,"$1"),u=u.replace(e,t),n},getRegex:function(){return new RegExp(u,e)}};return n}var f=/[^\w:]/g,Z=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function g(e,t,u){if(e){try{n=decodeURIComponent(x(u)).replace(f,"").toLowerCase();}catch(e){return null}if(0===n.indexOf("javascript:")||0===n.indexOf("vbscript:")||0===n.indexOf("data:"))return null}var n;t&&!Z.test(u)&&(e=u,F[" "+(n=t)]||(O.test(n)?F[" "+n]=n+"/":F[" "+n]=k(n,"/",!0)),t=-1===(n=F[" "+n]).indexOf(":"),u="//"===e.substring(0,2)?t?e:n.replace(q,"$1")+e:"/"===e.charAt(0)?t?e:n.replace(L,"$1")+e:n+e);try{u=encodeURI(u).replace(/%25/g,"%");}catch(e){return null}return u}var F={},O=/^[^:]+:\/*[^/]*$/,q=/^([^:]+:)[\s\S]*$/,L=/^([^:]+:\/*[^/]*)[\s\S]*$/;var A={exec:function(){}};function d(e){for(var t,u,n=1;n<arguments.length;n++)for(u in t=arguments[n])Object.prototype.hasOwnProperty.call(t,u)&&(e[u]=t[u]);return e}function C(e,t){var u=e.replace(/\|/g,function(e,t,u){for(var n=!1,r=t;0<=--r&&"\\"===u[r];)n=!n;return n?"|":" |"}).split(/ \|/),n=0;if(u[0].trim()||u.shift(),0<u.length&&!u[u.length-1].trim()&&u.pop(),u.length>t)u.splice(t);else for(;u.length<t;)u.push("");for(;n<u.length;n++)u[n]=u[n].trim().replace(/\\\|/g,"|");return u}function k(e,t,u){var n=e.length;if(0===n)return "";for(var r=0;r<n;){var i=e.charAt(n-r-1);if(i!==t||u){if(i===t||!u)break;r++;}else r++;}return e.slice(0,n-r)}function E(e){e&&e.sanitize&&!e.silent&&console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");}function m(e,t){if(t<1)return "";for(var u="";1<t;)1&t&&(u+=e),t>>=1,e+=e;return u+e}function b(e,t,u,n){var r=t.href,t=t.title?D(t.title):null,i=e[1].replace(/\\([\[\]])/g,"$1");return "!"!==e[0].charAt(0)?(n.state.inLink=!0,e={type:"link",raw:u,href:r,title:t,text:i,tokens:n.inlineTokens(i,[])},n.state.inLink=!1,e):{type:"image",raw:u,href:r,title:t,text:D(i)}}var w=function(){function e(e){this.options=e||r.defaults;}var t=e.prototype;return t.space=function(e){e=this.rules.block.newline.exec(e);if(e&&0<e[0].length)return {type:"space",raw:e[0]}},t.code=function(e){var t,e=this.rules.block.code.exec(e);if(e)return t=e[0].replace(/^ {1,4}/gm,""),{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:k(t,"\n")}},t.fences=function(e){var t,u,e=this.rules.block.fences.exec(e);if(e)return u=function(e,t){if(null===(e=e.match(/^(\s+)(?:```)/)))return t;var u=e[1];return t.split("\n").map(function(e){var t=e.match(/^\s+/);return null!==t&&t[0].length>=u.length?e.slice(u.length):e}).join("\n")}(t=e[0],e[3]||""),{type:"code",raw:t,lang:e[2]&&e[2].trim(),text:u}},t.heading=function(e){var t,u,e=this.rules.block.heading.exec(e);if(e)return t=e[2].trim(),/#$/.test(t)&&(u=k(t,"#"),!this.options.pedantic&&u&&!/ $/.test(u)||(t=u.trim())),u={type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:[]},this.lexer.inline(u.text,u.tokens),u},t.hr=function(e){e=this.rules.block.hr.exec(e);if(e)return {type:"hr",raw:e[0]}},t.blockquote=function(e){var t,e=this.rules.block.blockquote.exec(e);if(e)return t=e[0].replace(/^ *>[ \t]?/gm,""),{type:"blockquote",raw:e[0],tokens:this.lexer.blockTokens(t,[]),text:t}},t.list=function(e){var t=this.rules.block.list.exec(e);if(t){var u,n,r,i,s,l,a,o,D,c,h,p=1<(g=t[1].trim()).length,f={type:"list",raw:"",ordered:p,start:p?+g.slice(0,-1):"",loose:!1,items:[]},g=p?"\\d{1,9}\\"+g.slice(-1):"\\"+g;this.options.pedantic&&(g=p?g:"[*+-]");for(var F=new RegExp("^( {0,3}"+g+")((?:[\t ][^\\n]*)?(?:\\n|$))");e&&(h=!1,t=F.exec(e))&&!this.rules.block.hr.test(e);){if(u=t[0],e=e.substring(u.length),a=t[2].split("\n",1)[0],o=e.split("\n",1)[0],this.options.pedantic?(i=2,c=a.trimLeft()):(i=t[2].search(/[^ ]/),c=a.slice(i=4<i?1:i),i+=t[1].length),s=!1,!a&&/^ *$/.test(o)&&(u+=o+"\n",e=e.substring(o.length+1),h=!0),!h)for(var A=new RegExp("^ {0,"+Math.min(3,i-1)+"}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))"),d=new RegExp("^ {0,"+Math.min(3,i-1)+"}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)"),C=new RegExp("^ {0,"+Math.min(3,i-1)+"}(?:```|~~~)"),k=new RegExp("^ {0,"+Math.min(3,i-1)+"}#");e&&(a=D=e.split("\n",1)[0],this.options.pedantic&&(a=a.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),!C.test(a))&&!k.test(a)&&!A.test(a)&&!d.test(e);){if(a.search(/[^ ]/)>=i||!a.trim())c+="\n"+a.slice(i);else {if(s)break;c+="\n"+a;}s||a.trim()||(s=!0),u+=D+"\n",e=e.substring(D.length+1);}f.loose||(l?f.loose=!0:/\n *\n *$/.test(u)&&(l=!0)),this.options.gfm&&(n=/^\[[ xX]\] /.exec(c))&&(r="[ ] "!==n[0],c=c.replace(/^\[[ xX]\] +/,"")),f.items.push({type:"list_item",raw:u,task:!!n,checked:r,loose:!1,text:c}),f.raw+=u;}f.items[f.items.length-1].raw=u.trimRight(),f.items[f.items.length-1].text=c.trimRight(),f.raw=f.raw.trimRight();for(var E=f.items.length,x=0;x<E;x++){this.lexer.state.top=!1,f.items[x].tokens=this.lexer.blockTokens(f.items[x].text,[]);var m=f.items[x].tokens.filter(function(e){return "space"===e.type}),b=m.every(function(e){for(var t,u=0,n=B(e.raw.split(""));!(t=n()).done;)if("\n"===t.value&&(u+=1),1<u)return !0;return !1});!f.loose&&m.length&&b&&(f.loose=!0,f.items[x].loose=!0);}return f}},t.html=function(e){var t,e=this.rules.block.html.exec(e);if(e)return t={type:"html",raw:e[0],pre:!this.options.sanitizer&&("pre"===e[1]||"script"===e[1]||"style"===e[1]),text:e[0]},this.options.sanitize&&(t.type="paragraph",t.text=this.options.sanitizer?this.options.sanitizer(e[0]):D(e[0]),t.tokens=[],this.lexer.inline(t.text,t.tokens)),t},t.def=function(e){e=this.rules.block.def.exec(e);if(e)return e[3]&&(e[3]=e[3].substring(1,e[3].length-1)),{type:"def",tag:e[1].toLowerCase().replace(/\s+/g," "),raw:e[0],href:e[2],title:e[3]}},t.table=function(e){e=this.rules.block.table.exec(e);if(e){var t={type:"table",header:C(e[1]).map(function(e){return {text:e}}),align:e[2].replace(/^ *|\| *$/g,"").split(/ *\| */),rows:e[3]&&e[3].trim()?e[3].replace(/\n[ \t]*$/,"").split("\n"):[]};if(t.header.length===t.align.length){t.raw=e[0];for(var u,n,r,i=t.align.length,s=0;s<i;s++)/^ *-+: *$/.test(t.align[s])?t.align[s]="right":/^ *:-+: *$/.test(t.align[s])?t.align[s]="center":/^ *:-+ *$/.test(t.align[s])?t.align[s]="left":t.align[s]=null;for(i=t.rows.length,s=0;s<i;s++)t.rows[s]=C(t.rows[s],t.header.length).map(function(e){return {text:e}});for(i=t.header.length,u=0;u<i;u++)t.header[u].tokens=[],this.lexer.inline(t.header[u].text,t.header[u].tokens);for(i=t.rows.length,u=0;u<i;u++)for(r=t.rows[u],n=0;n<r.length;n++)r[n].tokens=[],this.lexer.inline(r[n].text,r[n].tokens);return t}}},t.lheading=function(e){var e=this.rules.block.lheading.exec(e);if(e)return e={type:"heading",raw:e[0],depth:"="===e[2].charAt(0)?1:2,text:e[1],tokens:[]},this.lexer.inline(e.text,e.tokens),e},t.paragraph=function(e){var e=this.rules.block.paragraph.exec(e);if(e)return e={type:"paragraph",raw:e[0],text:"\n"===e[1].charAt(e[1].length-1)?e[1].slice(0,-1):e[1],tokens:[]},this.lexer.inline(e.text,e.tokens),e},t.text=function(e){var e=this.rules.block.text.exec(e);if(e)return e={type:"text",raw:e[0],text:e[0],tokens:[]},this.lexer.inline(e.text,e.tokens),e},t.escape=function(e){e=this.rules.inline.escape.exec(e);if(e)return {type:"escape",raw:e[0],text:D(e[1])}},t.tag=function(e){e=this.rules.inline.tag.exec(e);if(e)return !this.lexer.state.inLink&&/^<a /i.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:this.options.sanitize?"text":"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(e[0]):D(e[0]):e[0]}},t.link=function(e){e=this.rules.inline.link.exec(e);if(e){var t=e[2].trim();if(!this.options.pedantic&&/^</.test(t)){if(!/>$/.test(t))return;var u=k(t.slice(0,-1),"\\");if((t.length-u.length)%2==0)return}else {u=function(e,t){if(-1!==e.indexOf(t[1]))for(var u=e.length,n=0,r=0;r<u;r++)if("\\"===e[r])r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&--n<0)return r;return -1}(e[2],"()");-1<u&&(r=(0===e[0].indexOf("!")?5:4)+e[1].length+u,e[2]=e[2].substring(0,u),e[0]=e[0].substring(0,r).trim(),e[3]="");}var n,u=e[2],r="";return this.options.pedantic?(n=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(u))&&(u=n[1],r=n[3]):r=e[3]?e[3].slice(1,-1):"",u=u.trim(),b(e,{href:(u=/^</.test(u)?this.options.pedantic&&!/>$/.test(t)?u.slice(1):u.slice(1,-1):u)&&u.replace(this.rules.inline._escapes,"$1"),title:r&&r.replace(this.rules.inline._escapes,"$1")},e[0],this.lexer)}},t.reflink=function(e,t){var u;if((u=this.rules.inline.reflink.exec(e))||(u=this.rules.inline.nolink.exec(e)))return (e=t[(e=(u[2]||u[1]).replace(/\s+/g," ")).toLowerCase()])&&e.href?b(u,e,u[0],this.lexer):{type:"text",raw:t=u[0].charAt(0),text:t}},t.emStrong=function(e,t,u){void 0===u&&(u="");var n=this.rules.inline.emStrong.lDelim.exec(e);if(n&&(!n[3]||!u.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/))){var r=n[1]||n[2]||"";if(!r||""===u||this.rules.inline.punctuation.exec(u)){var i=n[0].length-1,s=i,l=0,a="*"===n[0][0]?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;for(a.lastIndex=0,t=t.slice(-1*e.length+i);null!=(n=a.exec(t));)if(o=n[1]||n[2]||n[3]||n[4]||n[5]||n[6])if(o=o.length,n[3]||n[4])s+=o;else if((n[5]||n[6])&&i%3&&!((i+o)%3))l+=o;else if(!(0<(s-=o))){var o=Math.min(o,o+s+l);if(Math.min(i,o)%2)return D=e.slice(1,i+n.index+o),{type:"em",raw:e.slice(0,i+n.index+o+1),text:D,tokens:this.lexer.inlineTokens(D,[])};var D=e.slice(2,i+n.index+o-1);return {type:"strong",raw:e.slice(0,i+n.index+o+1),text:D,tokens:this.lexer.inlineTokens(D,[])}}}}},t.codespan=function(e){var t,u,n,e=this.rules.inline.code.exec(e);if(e)return n=e[2].replace(/\n/g," "),t=/[^ ]/.test(n),u=/^ /.test(n)&&/ $/.test(n),n=D(n=t&&u?n.substring(1,n.length-1):n,!0),{type:"codespan",raw:e[0],text:n}},t.br=function(e){e=this.rules.inline.br.exec(e);if(e)return {type:"br",raw:e[0]}},t.del=function(e){e=this.rules.inline.del.exec(e);if(e)return {type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2],[])}},t.autolink=function(e,t){var u,e=this.rules.inline.autolink.exec(e);if(e)return t="@"===e[2]?"mailto:"+(u=D(this.options.mangle?t(e[1]):e[1])):u=D(e[1]),{type:"link",raw:e[0],text:u,href:t,tokens:[{type:"text",raw:u,text:u}]}},t.url=function(e,t){var u,n,r,i;if(u=this.rules.inline.url.exec(e)){if("@"===u[2])r="mailto:"+(n=D(this.options.mangle?t(u[0]):u[0]));else {for(;i=u[0],u[0]=this.rules.inline._backpedal.exec(u[0])[0],i!==u[0];);n=D(u[0]),r="www."===u[1]?"http://"+n:n;}return {type:"link",raw:u[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}},t.inlineText=function(e,t){e=this.rules.inline.text.exec(e);if(e)return t=this.lexer.state.inRawBlock?this.options.sanitize?this.options.sanitizer?this.options.sanitizer(e[0]):D(e[0]):e[0]:D(this.options.smartypants?t(e[0]):e[0]),{type:"text",raw:e[0],text:t}},e}(),y={newline:/^(?: *(?:\n|$))+/,code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr:/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",def:/^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,table:A,lheading:/^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,text:/^[^\n]+/,_label:/(?!\s*\])(?:\\.|[^\[\]\\])+/,_title:/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/},v=(y.def=p(y.def).replace("label",y._label).replace("title",y._title).getRegex(),y.bullet=/(?:[*+-]|\d{1,9}[.)])/,y.listItemStart=p(/^( *)(bull) */).replace("bull",y.bullet).getRegex(),y.list=p(y.list).replace(/bull/g,y.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+y.def.source+")").getRegex(),y._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",y._comment=/<!--(?!-?>)[\s\S]*?(?:-->|$)/,y.html=p(y.html,"i").replace("comment",y._comment).replace("tag",y._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),y.paragraph=p(y._paragraph).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.blockquote=p(y.blockquote).replace("paragraph",y.paragraph).getRegex(),y.normal=d({},y),y.gfm=d({},y.normal,{table:"^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"}),y.gfm.table=p(y.gfm.table).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.gfm.paragraph=p(y._paragraph).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",y.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.pedantic=d({},y.normal,{html:p("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",y._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:A,paragraph:p(y.normal._paragraph).replace("hr",y.hr).replace("heading"," *#{1,6} *[^\n]").replace("lheading",y.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()}),{escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:A,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(ref)\]/,nolink:/^!?\[(ref)\](?:\[\])?/,reflinkSearch:"reflink|nolink(?!\\()",emStrong:{lDelim:/^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,rDelimAst:/^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[^*]+(?=[^*])|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,rDelimUnd:/^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/},code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:A,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,punctuation:/^([\spunctuation])/});function j(e){return e.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")}function _(e){for(var t,u="",n=e.length,r=0;r<n;r++)t=e.charCodeAt(r),u+="&#"+(t=.5<Math.random()?"x"+t.toString(16):t)+";";return u}v._punctuation="!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~",v.punctuation=p(v.punctuation).replace(/punctuation/g,v._punctuation).getRegex(),v.blockSkip=/\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g,v.escapedEmSt=/\\\*|\\_/g,v._comment=p(y._comment).replace("(?:--\x3e|$)","--\x3e").getRegex(),v.emStrong.lDelim=p(v.emStrong.lDelim).replace(/punct/g,v._punctuation).getRegex(),v.emStrong.rDelimAst=p(v.emStrong.rDelimAst,"g").replace(/punct/g,v._punctuation).getRegex(),v.emStrong.rDelimUnd=p(v.emStrong.rDelimUnd,"g").replace(/punct/g,v._punctuation).getRegex(),v._escapes=/\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,v._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,v._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,v.autolink=p(v.autolink).replace("scheme",v._scheme).replace("email",v._email).getRegex(),v._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/,v.tag=p(v.tag).replace("comment",v._comment).replace("attribute",v._attribute).getRegex(),v._label=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,v._href=/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/,v._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,v.link=p(v.link).replace("label",v._label).replace("href",v._href).replace("title",v._title).getRegex(),v.reflink=p(v.reflink).replace("label",v._label).replace("ref",y._label).getRegex(),v.nolink=p(v.nolink).replace("ref",y._label).getRegex(),v.reflinkSearch=p(v.reflinkSearch,"g").replace("reflink",v.reflink).replace("nolink",v.nolink).getRegex(),v.normal=d({},v),v.pedantic=d({},v.normal,{strong:{start:/^__|\*\*/,middle:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,endAst:/\*\*(?!\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\*/,middle:/^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,endAst:/\*(?!\*)/g,endUnd:/_(?!_)/g},link:p(/^!?\[(label)\]\((.*?)\)/).replace("label",v._label).getRegex(),reflink:p(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",v._label).getRegex()}),v.gfm=d({},v.normal,{escape:p(v.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/}),v.gfm.url=p(v.gfm.url,"i").replace("email",v.gfm._extended_email).getRegex(),v.breaks=d({},v.gfm,{br:p(v.br).replace("{2,}","*").getRegex(),text:p(v.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()});var z=function(){function u(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||r.defaults,this.options.tokenizer=this.options.tokenizer||new w,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,(this.tokenizer.lexer=this).inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};e={block:y.normal,inline:v.normal};this.options.pedantic?(e.block=y.pedantic,e.inline=v.pedantic):this.options.gfm&&(e.block=y.gfm,this.options.breaks?e.inline=v.breaks:e.inline=v.gfm),this.tokenizer.rules=e;}u.lex=function(e,t){return new u(t).lex(e)},u.lexInline=function(e,t){return new u(t).inlineTokens(e)};var e,t,n=u.prototype;return n.lex=function(e){var t;for(e=e.replace(/\r\n|\r/g,"\n"),this.blockTokens(e,this.tokens);t=this.inlineQueue.shift();)this.inlineTokens(t.src,t.tokens);return this.tokens},n.blockTokens=function(r,t){var u,e,i,n,s=this;for(void 0===t&&(t=[]),r=this.options.pedantic?r.replace(/\t/g,"    ").replace(/^ +$/gm,""):r.replace(/^( *)(\t+)/gm,function(e,t,u){return t+"    ".repeat(u.length)});r;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(function(e){return !!(u=e.call({lexer:s},r,t))&&(r=r.substring(u.raw.length),t.push(u),!0)})))if(u=this.tokenizer.space(r))r=r.substring(u.raw.length),1===u.raw.length&&0<t.length?t[t.length-1].raw+="\n":t.push(u);else if(u=this.tokenizer.code(r))r=r.substring(u.raw.length),!(e=t[t.length-1])||"paragraph"!==e.type&&"text"!==e.type?t.push(u):(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue[this.inlineQueue.length-1].src=e.text);else if(u=this.tokenizer.fences(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.heading(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.hr(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.blockquote(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.list(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.html(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.def(r))r=r.substring(u.raw.length),!(e=t[t.length-1])||"paragraph"!==e.type&&"text"!==e.type?this.tokens.links[u.tag]||(this.tokens.links[u.tag]={href:u.href,title:u.title}):(e.raw+="\n"+u.raw,e.text+="\n"+u.raw,this.inlineQueue[this.inlineQueue.length-1].src=e.text);else if(u=this.tokenizer.table(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.lheading(r))r=r.substring(u.raw.length),t.push(u);else if(i=r,this.options.extensions&&this.options.extensions.startBlock&&!function(){var t=1/0,u=r.slice(1),n=void 0;s.options.extensions.startBlock.forEach(function(e){"number"==typeof(n=e.call({lexer:this},u))&&0<=n&&(t=Math.min(t,n));}),t<1/0&&0<=t&&(i=r.substring(0,t+1));}(),this.state.top&&(u=this.tokenizer.paragraph(i)))e=t[t.length-1],n&&"paragraph"===e.type?(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=e.text):t.push(u),n=i.length!==r.length,r=r.substring(u.raw.length);else if(u=this.tokenizer.text(r))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===e.type?(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=e.text):t.push(u);else if(r){var l="Infinite loop on byte: "+r.charCodeAt(0);if(this.options.silent){console.error(l);break}throw new Error(l)}return this.state.top=!0,t},n.inline=function(e,t){this.inlineQueue.push({src:e,tokens:t});},n.inlineTokens=function(r,t){var u,e,i,n,s,l,a=this,o=(void 0===t&&(t=[]),r);if(this.tokens.links){var D=Object.keys(this.tokens.links);if(0<D.length)for(;null!=(n=this.tokenizer.rules.inline.reflinkSearch.exec(o));)D.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,n.index)+"["+m("a",n[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));}for(;null!=(n=this.tokenizer.rules.inline.blockSkip.exec(o));)o=o.slice(0,n.index)+"["+m("a",n[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(n=this.tokenizer.rules.inline.escapedEmSt.exec(o));)o=o.slice(0,n.index)+"++"+o.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);for(;r;)if(s||(l=""),s=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(function(e){return !!(u=e.call({lexer:a},r,t))&&(r=r.substring(u.raw.length),t.push(u),!0)})))if(u=this.tokenizer.escape(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.tag(r))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===u.type&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(u=this.tokenizer.link(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.reflink(r,this.tokens.links))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===u.type&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(u=this.tokenizer.emStrong(r,o,l))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.codespan(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.br(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.del(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.autolink(r,_))r=r.substring(u.raw.length),t.push(u);else if(!this.state.inLink&&(u=this.tokenizer.url(r,_)))r=r.substring(u.raw.length),t.push(u);else if(i=r,this.options.extensions&&this.options.extensions.startInline&&!function(){var t=1/0,u=r.slice(1),n=void 0;a.options.extensions.startInline.forEach(function(e){"number"==typeof(n=e.call({lexer:this},u))&&0<=n&&(t=Math.min(t,n));}),t<1/0&&0<=t&&(i=r.substring(0,t+1));}(),u=this.tokenizer.inlineText(i,j))r=r.substring(u.raw.length),"_"!==u.raw.slice(-1)&&(l=u.raw.slice(-1)),s=!0,(e=t[t.length-1])&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(r){var c="Infinite loop on byte: "+r.charCodeAt(0);if(this.options.silent){console.error(c);break}throw new Error(c)}return t},n=u,t=[{key:"rules",get:function(){return {block:y,inline:v}}}],(e=null)&&i(n.prototype,e),t&&i(n,t),Object.defineProperty(n,"prototype",{writable:!1}),u}(),$=function(){function e(e){this.options=e||r.defaults;}var t=e.prototype;return t.code=function(e,t,u){var n,t=(t||"").match(/\S*/)[0];return this.options.highlight&&null!=(n=this.options.highlight(e,t))&&n!==e&&(u=!0,e=n),e=e.replace(/\n$/,"")+"\n",t?'<pre><code class="'+this.options.langPrefix+D(t,!0)+'">'+(u?e:D(e,!0))+"</code></pre>\n":"<pre><code>"+(u?e:D(e,!0))+"</code></pre>\n"},t.blockquote=function(e){return "<blockquote>\n"+e+"</blockquote>\n"},t.html=function(e){return e},t.heading=function(e,t,u,n){return this.options.headerIds?"<h"+t+' id="'+(this.options.headerPrefix+n.slug(u))+'">'+e+"</h"+t+">\n":"<h"+t+">"+e+"</h"+t+">\n"},t.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},t.list=function(e,t,u){var n=t?"ol":"ul";return "<"+n+(t&&1!==u?' start="'+u+'"':"")+">\n"+e+"</"+n+">\n"},t.listitem=function(e){return "<li>"+e+"</li>\n"},t.checkbox=function(e){return "<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "},t.paragraph=function(e){return "<p>"+e+"</p>\n"},t.table=function(e,t){return "<table>\n<thead>\n"+e+"</thead>\n"+(t=t&&"<tbody>"+t+"</tbody>")+"</table>\n"},t.tablerow=function(e){return "<tr>\n"+e+"</tr>\n"},t.tablecell=function(e,t){var u=t.header?"th":"td";return (t.align?"<"+u+' align="'+t.align+'">':"<"+u+">")+e+"</"+u+">\n"},t.strong=function(e){return "<strong>"+e+"</strong>"},t.em=function(e){return "<em>"+e+"</em>"},t.codespan=function(e){return "<code>"+e+"</code>"},t.br=function(){return this.options.xhtml?"<br/>":"<br>"},t.del=function(e){return "<del>"+e+"</del>"},t.link=function(e,t,u){if(null===(e=g(this.options.sanitize,this.options.baseUrl,e)))return u;e='<a href="'+D(e)+'"';return t&&(e+=' title="'+t+'"'),e+=">"+u+"</a>"},t.image=function(e,t,u){if(null===(e=g(this.options.sanitize,this.options.baseUrl,e)))return u;e='<img src="'+e+'" alt="'+u+'"';return t&&(e+=' title="'+t+'"'),e+=this.options.xhtml?"/>":">"},t.text=function(e){return e},e}(),S=function(){function e(){}var t=e.prototype;return t.strong=function(e){return e},t.em=function(e){return e},t.codespan=function(e){return e},t.del=function(e){return e},t.html=function(e){return e},t.text=function(e){return e},t.link=function(e,t,u){return ""+u},t.image=function(e,t,u){return ""+u},t.br=function(){return ""},e}(),T=function(){function e(){this.seen={};}var t=e.prototype;return t.serialize=function(e){return e.toLowerCase().trim().replace(/<[!\/a-z].*?>/gi,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-")},t.getNextSafeSlug=function(e,t){var u=e,n=0;if(this.seen.hasOwnProperty(u))for(n=this.seen[e];u=e+"-"+ ++n,this.seen.hasOwnProperty(u););return t||(this.seen[e]=n,this.seen[u]=0),u},t.slug=function(e,t){void 0===t&&(t={});e=this.serialize(e);return this.getNextSafeSlug(e,t.dryrun)},e}(),R=function(){function u(e){this.options=e||r.defaults,this.options.renderer=this.options.renderer||new $,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new S,this.slugger=new T;}u.parse=function(e,t){return new u(t).parse(e)},u.parseInline=function(e,t){return new u(t).parseInline(e)};var e=u.prototype;return e.parse=function(e,t){void 0===t&&(t=!0);for(var u,n,r,i,s,l,a,o,D,c,h,p,f,g,F,A,d="",C=e.length,k=0;k<C;k++)if(o=e[k],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[o.type]&&(!1!==(A=this.options.extensions.renderers[o.type].call({parser:this},o))||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)))d+=A||"";else switch(o.type){case"space":continue;case"hr":d+=this.renderer.hr();continue;case"heading":d+=this.renderer.heading(this.parseInline(o.tokens),o.depth,x(this.parseInline(o.tokens,this.textRenderer)),this.slugger);continue;case"code":d+=this.renderer.code(o.text,o.lang,o.escaped);continue;case"table":for(l=D="",r=o.header.length,u=0;u<r;u++)l+=this.renderer.tablecell(this.parseInline(o.header[u].tokens),{header:!0,align:o.align[u]});for(D+=this.renderer.tablerow(l),a="",r=o.rows.length,u=0;u<r;u++){for(l="",i=(s=o.rows[u]).length,n=0;n<i;n++)l+=this.renderer.tablecell(this.parseInline(s[n].tokens),{header:!1,align:o.align[n]});a+=this.renderer.tablerow(l);}d+=this.renderer.table(D,a);continue;case"blockquote":a=this.parse(o.tokens),d+=this.renderer.blockquote(a);continue;case"list":for(D=o.ordered,E=o.start,c=o.loose,r=o.items.length,a="",u=0;u<r;u++)f=(p=o.items[u]).checked,g=p.task,h="",p.task&&(F=this.renderer.checkbox(f),c?0<p.tokens.length&&"paragraph"===p.tokens[0].type?(p.tokens[0].text=F+" "+p.tokens[0].text,p.tokens[0].tokens&&0<p.tokens[0].tokens.length&&"text"===p.tokens[0].tokens[0].type&&(p.tokens[0].tokens[0].text=F+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:F}):h+=F),h+=this.parse(p.tokens,c),a+=this.renderer.listitem(h,g,f);d+=this.renderer.list(a,D,E);continue;case"html":d+=this.renderer.html(o.text);continue;case"paragraph":d+=this.renderer.paragraph(this.parseInline(o.tokens));continue;case"text":for(a=o.tokens?this.parseInline(o.tokens):o.text;k+1<C&&"text"===e[k+1].type;)a+="\n"+((o=e[++k]).tokens?this.parseInline(o.tokens):o.text);d+=t?this.renderer.paragraph(a):a;continue;default:var E='Token with "'+o.type+'" type was not found.';if(this.options.silent)return void console.error(E);throw new Error(E)}return d},e.parseInline=function(e,t){t=t||this.renderer;for(var u,n,r="",i=e.length,s=0;s<i;s++)if(u=e[s],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[u.type]&&(!1!==(n=this.options.extensions.renderers[u.type].call({parser:this},u))||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(u.type)))r+=n||"";else switch(u.type){case"escape":r+=t.text(u.text);break;case"html":r+=t.html(u.text);break;case"link":r+=t.link(u.href,u.title,this.parseInline(u.tokens,t));break;case"image":r+=t.image(u.href,u.title,u.text);break;case"strong":r+=t.strong(this.parseInline(u.tokens,t));break;case"em":r+=t.em(this.parseInline(u.tokens,t));break;case"codespan":r+=t.codespan(u.text);break;case"br":r+=t.br();break;case"del":r+=t.del(this.parseInline(u.tokens,t));break;case"text":r+=t.text(u.text);break;default:var l='Token with "'+u.type+'" type was not found.';if(this.options.silent)return void console.error(l);throw new Error(l)}return r},u}();function I(e,u,n){if(null==e)throw new Error("marked(): input parameter is undefined or null");if("string"!=typeof e)throw new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected");if("function"==typeof u&&(n=u,u=null),E(u=d({},I.defaults,u||{})),n){var r,i=u.highlight;try{r=z.lex(e,u);}catch(e){return n(e)}var s=function(t){var e;if(!t)try{u.walkTokens&&I.walkTokens(r,u.walkTokens),e=R.parse(r,u);}catch(e){t=e;}return u.highlight=i,t?n(t):n(null,e)};if(!i||i.length<3)return s();if(delete u.highlight,!r.length)return s();var l=0;return I.walkTokens(r,function(u){"code"===u.type&&(l++,setTimeout(function(){i(u.text,u.lang,function(e,t){if(e)return s(e);null!=t&&t!==u.text&&(u.text=t,u.escaped=!0),0===--l&&s();});},0));}),void(0===l&&s())}try{var t=z.lex(e,u);return u.walkTokens&&I.walkTokens(t,u.walkTokens),R.parse(t,u)}catch(e){if(e.message+="\nPlease report this to https://github.com/markedjs/marked.",u.silent)return "<p>An error occurred:</p><pre>"+D(e.message+"",!0)+"</pre>";throw e}}I.options=I.setOptions=function(e){return d(I.defaults,e),e=I.defaults,r.defaults=e,I},I.getDefaults=e,I.defaults=r.defaults,I.use=function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n,r=d.apply(void 0,[{}].concat(t)),o=I.defaults.extensions||{renderers:{},childTokens:{}};t.forEach(function(s){if(s.extensions&&(n=!0,s.extensions.forEach(function(r){if(!r.name)throw new Error("extension name required");var i;if(r.renderer&&(i=o.renderers?o.renderers[r.name]:null,o.renderers[r.name]=i?function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=r.renderer.apply(this,t);return n=!1===n?i.apply(this,t):n}:r.renderer),r.tokenizer){if(!r.level||"block"!==r.level&&"inline"!==r.level)throw new Error("extension level must be 'block' or 'inline'");o[r.level]?o[r.level].unshift(r.tokenizer):o[r.level]=[r.tokenizer],r.start&&("block"===r.level?o.startBlock?o.startBlock.push(r.start):o.startBlock=[r.start]:"inline"===r.level&&(o.startInline?o.startInline.push(r.start):o.startInline=[r.start]));}r.childTokens&&(o.childTokens[r.name]=r.childTokens);})),s.renderer){var e,l=I.defaults.renderer||new $;for(e in s.renderer)!function(r){var i=l[r];l[r]=function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=s.renderer[r].apply(l,t);return n=!1===n?i.apply(l,t):n};}(e);r.renderer=l;}if(s.tokenizer){var t,a=I.defaults.tokenizer||new w;for(t in s.tokenizer)!function(r){var i=a[r];a[r]=function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=s.tokenizer[r].apply(a,t);return n=!1===n?i.apply(a,t):n};}(t);r.tokenizer=a;}var u;s.walkTokens&&(u=I.defaults.walkTokens,r.walkTokens=function(e){s.walkTokens.call(this,e),u&&u.call(this,e);}),n&&(r.extensions=o),I.setOptions(r);});},I.walkTokens=function(e,l){for(var a,t=B(e);!(a=t()).done;)!function(){var t=a.value;switch(l.call(I,t),t.type){case"table":for(var e=B(t.header);!(u=e()).done;){var u=u.value;I.walkTokens(u.tokens,l);}for(var n,r=B(t.rows);!(n=r()).done;)for(var i=B(n.value);!(s=i()).done;){var s=s.value;I.walkTokens(s.tokens,l);}break;case"list":I.walkTokens(t.items,l);break;default:I.defaults.extensions&&I.defaults.extensions.childTokens&&I.defaults.extensions.childTokens[t.type]?I.defaults.extensions.childTokens[t.type].forEach(function(e){I.walkTokens(t[e],l);}):t.tokens&&I.walkTokens(t.tokens,l);}}();},I.parseInline=function(e,t){if(null==e)throw new Error("marked.parseInline(): input parameter is undefined or null");if("string"!=typeof e)throw new Error("marked.parseInline(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected");E(t=d({},I.defaults,t||{}));try{var u=z.lexInline(e,t);return t.walkTokens&&I.walkTokens(u,t.walkTokens),R.parseInline(u,t)}catch(e){if(e.message+="\nPlease report this to https://github.com/markedjs/marked.",t.silent)return "<p>An error occurred:</p><pre>"+D(e.message+"",!0)+"</pre>";throw e}},I.Parser=R,I.parser=R.parse,I.Renderer=$,I.TextRenderer=S,I.Lexer=z,I.lexer=z.lex,I.Tokenizer=w,I.Slugger=T;var A=(I.parse=I).options,P=I.setOptions,Q=I.use,U=I.walkTokens,M=I.parseInline,N=I,X=R.parse,G=z.lex;r.Lexer=z,r.Parser=R,r.Renderer=$,r.Slugger=T,r.TextRenderer=S,r.Tokenizer=w,r.getDefaults=e,r.lexer=G,r.marked=I,r.options=A,r.parse=N,r.parseInline=M,r.parser=X,r.setOptions=P,r.use=Q,r.walkTokens=U,Object.defineProperty(r,"__esModule",{value:!0});});
    });

    /* src/Postpage.svelte generated by Svelte v3.49.0 */

    const { console: console_1$2 } = globals;

    const file$2 = "src/Postpage.svelte";

    // (41:0) {#if postobj !== undefined}
    function create_if_block$2(ctx) {
    	let h1;
    	let t0_value = /*postobj*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let html_tag;
    	let raw_value = /*postobj*/ ctx[0].text + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			add_location(h1, file$2, 41, 2, 1226);
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*postobj*/ 1 && t0_value !== (t0_value = /*postobj*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*postobj*/ 1 && raw_value !== (raw_value = /*postobj*/ ctx[0].text + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:0) {#if postobj !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*postobj*/ ctx[0] !== undefined && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*postobj*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Postpage', slots, []);
    	let { params = { postId: undefined } } = $$props;
    	let { postobj = undefined } = $$props;
    	const options = { displayMode: true, throwOnError: false };
    	let katexString = str => katex__default['default'].renderToString(str, options);

    	function createHtmlBody(text) {
    		console.log(text);

    		return [text].map(x => marked.parse(x, {
    			gfm: true,
    			breaks: true,
    			hightlight: true
    		})).map(x => {
    			let temp = x;
    			x.match(/(?<=\${1,2}).*?(?=\${1,2})/g).forEach(y => temp.replace(y, katexString(y)));
    			return temp;
    		});
    	}

    	async function loadData() {
    		await fetch(`https://raw.githubusercontent.com/simojo/www/dev-svelte/posts/${params.postId}.md`).then(x => x.text()).then(x => $$invalidate(0, postobj = {
    			postid: params.postId,
    			title: x.split("\n")[0].match(/(?<=# ).*/g)[0],
    			subtitle: x.split("\n")[1].match(/(?<=## ).*/g)[0],
    			date: x.split("\n")[2].match(/(?<=### ).*/g)[0],
    			text: createHtmlBody(x.split("\n").slice(3).reduce((i, a) => i + "\n" + a))
    		}));
    	}

    	loadData();
    	const writable_props = ['params', 'postobj'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Postpage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    		if ('postobj' in $$props) $$invalidate(0, postobj = $$props.postobj);
    	};

    	$$self.$capture_state = () => ({
    		params,
    		parse: marked.parse,
    		postobj,
    		options,
    		katex: katex__default['default'],
    		katexString,
    		createHtmlBody,
    		loadData
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    		if ('postobj' in $$props) $$invalidate(0, postobj = $$props.postobj);
    		if ('katexString' in $$props) katexString = $$props.katexString;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postobj, params];
    }

    class Postpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { params: 1, postobj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Postpage",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get params() {
    		throw new Error("<Postpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Postpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get postobj() {
    		throw new Error("<Postpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set postobj(value) {
    		throw new Error("<Postpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	let div0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div1;
    	let router;
    	let current;
    	let mounted;
    	let dispose;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Simon Jones";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Posts";
    			t3 = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(a0, "class", "nav");
    			add_location(a0, file$3, 27, 2, 503);
    			attr_dev(a1, "class", "nav");
    			add_location(a1, file$3, 28, 2, 568);
    			attr_dev(div0, "id", "navbar");
    			add_location(div0, file$3, 26, 0, 483);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$3, 30, 0, 637);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(router, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(router);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let routes = {
    		"/posts/:postId": Postpage,
    		"/": Home,
    		"*": Home
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		push("/");
    	};

    	const click_handler_1 = () => {
    		push("/posts/");
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		push,
    		wrap,
    		Home,
    		Postpage,
    		routes
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(0, routes = $$props.routes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [routes, click_handler, click_handler_1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}(katex));
//# sourceMappingURL=bundle.js.map
