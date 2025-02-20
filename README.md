# Install Angular CLI
    npm install -g @angular/cli

Navigate to project directory

    npm intall

# Run API Server
    npm run server
    browse http://localhost:9000/api/courses

# Run Angular project
    ng serve
    browse http://localhost:4200/

# Signals
    - Create signal : const counter = signal(0)
    - Angular creates WriteableSignal by default
    - Update the signal value : set() or update()
    - Create readonly signal : counter.asReadOnly()
    - Read only signal can not allow to set or update
    - provides type safety

# signal objects
    do not mutate object value directly
    recommended way to update the object signal using update method and use spread operator,get the property and update.

```
// object

type Counter = {
    count: number;
}

counter = signal<Counter>({
        count: 100
    }); 

this.counter
    .update(counter => 
    ({
        ...counter,
        count: counter.count + 1
    }));

// array
values = signal<number[]>([0]); 

this.values
    .update(values => 
    ([
        ...values,
        values[values.length - 1 ] + 1
    ]));

{{values().join(", ")}}
```
# Computed Signal
    Computed signals are readonly
    Can be referred to another signal
    Cyclic dependency signals are not allowed and errored out
        Error: Detected cycle in computations.
```
counter = signal<number>(0);

counter10 = computed(() => this.counter() * 10);

counter100 = computed(() => {
    const val = this.counter10() * 10;
    return val;
});

this.counter
    .update(
        counter => counter + 1
    )

<h3>{{counter()}}</h3>
<h4>{{counter10()}}</h4>
<h4>{{counter100()}}</h4>
```

# Effects
    Avoid using Effect
    Pure side effects. Used very rarely.
    Effects are reactive to the signal. Any changes in the signal immediately notifies to effects
    Make sure init the effect
    Can only used within an injection context such as constructor, factory function, a field init, or function used with runInInjectionContext.
    Typically used for
        Logging
        Drawing on canvas
        Manual DOM manipulations
        Sync with local store

```
constructor() {
    effect(() => {
        console.log(`Counter: ${this.counter()}`);
        console.log(`Counter10: ${this.counter10()}`);
    })
}

// manual cleanup
effectRef: EffectRef | null = null;

constructor() {
    this.effectRef = effect(() => {
        console.log(`Counter: ${this.counter()}`);
        console.log(`Counter10: ${this.counter10()}`);
    })
}

cleanUp() {
    this.effectRef?.destroy();
}

//automatic cleanup using injector
injector = inject(Injector)

constructor() {
    afterNextInjector(() => {
        effect(() => {
            console.log(`Counter: ${this.counter()}`);
            console.log(`Counter10: ${this.counter10()}`);
        },
        {
            injector: this.injector
        })
    })
}

```