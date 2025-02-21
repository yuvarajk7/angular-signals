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

# Call API Using fetch - GET
    Load get call from constructor, OnInit life cycle or afterNextRender hook method.
    Prefer using constructor

```
async loadAllCourses(): Promise<Course[]> {
    const response = await fetch(`${this.env.apiRoot}/courses`);
    const payload = await response.json();
    return payload.courses;
}

const courses = await this.courseSerice.loadAllCourses();
this.courses.set(courses);

```

# Call API Using fetch - POST

```
async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await fetch(`${this.env.apiRoot}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(course)
    });
    return await response.json();
}

```

# Call API Using fetch - PUT

```
async saveCourse(courseId: string, 
                    changes: Partial<Course>): Promise<Course> {
    const response = await fetch(`${this.env.apiRoot}/courses/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(changes)
    });
    return await response.json();
}

```

# Call API Using fetch - DELETE
```
async deleteCourse(courseId: string): Promise<void> {
    await fetch(`${this.env.apiRoot}/courses/${courseId}`, {
        method: "DELETE"
    });
}

```

# Angluar Http Client (2 way) - GET

```
async loadAllCourses(): Promise<Course[]> {
    const courses$ = this.http.get<GetCoursesResponse>(`${this.env.apiRoot}/courses`);
    const payload = await firstValueFrom(courses$);
    return payload.courses;
}

const courses = await this.courseSerice.loadAllCourses();
this.courses.set(courses);

```
# Angluar Http Client (2 way) - POST

```
async createCourse(course: Partial<Course>): Promise<Course> {
    const course$ = this.http.post<Course>(`${this.env.apiRoot}/courses`, course);
    return await firstValueFrom(course$);
  }

```

# Angluar Http Client (2 way) - PUT

```
async saveCourse(courseId: string, 
                changes: Partial<Course>): Promise<Course> {
    const course$ = this.http.put<Course>(`${this.env.apiRoot}/courses/${courseId}`, changes);
    return await firstValueFrom(course$);
  }

```

# Angluar Http Client (2 way) - DELETE

```
async deleteCourse(courseId: string): Promise<void> {
    const delete$ = this.http.delete<void>(`${this.env.apiRoot}/courses/${courseId}`);
    return await firstValueFrom(delete$);
}

```

# Input parameter to the child component
    Declare input varible : input.required()

```
child component
courses = input.required<Course[]>();

parent component
<courses-card-list [courses]="beginnerCourses()" />
```

# Output parameter to the parent component
    Declare output variable: output
    Emit the output to the parent

```
//child component
courseUpdated = output<Course>();
courseDeleted = output<string>();

this.courseUpdated.emit(newCourse);
this.courseDeleted.emit(course.id);

//parent template
<courses-card-list [courses]="beginnerCourses()" 
                    (courseUpdated)="onCourseUpdated($event)"
                    (courseDeleted)="onCourseDeleted($event)"/>
```

# Add new course to the existing course list

```
const newCourses = [...this.#courses(), newCourse];
this.#courses.set(newCourses.sort(sortCoursesBySeqNo));

```

# Delete a course and delete from the list

```
await this.courseSerice.deleteCourse(courseId);
const courses = this.#courses();
const newCourses = courses.filter(course => course.id !== courseId);
this.#courses.set(newCourses);

```

# Update a course and update the list

```
const courses = this.#courses();
const newCourses = courses.map(course => course.id === updatedCourse.id ? updatedCourse : course);
this.#courses.set(newCourses);

```

# Load indicator injected into Http Interceptor

```
export const loadingInterceptor : HttpInterceptorFn = 
    (request: HttpRequest<unknown>, next: HttpHandlerFn) => {

        if(request.context.get(SkipLoading)) {
            return next(request);
        }

        const loadingService = inject(LoadingService);
        loadingService.loadingOn();
        return next(request)
            .pipe(
                finalize(() => {
                    loadingService.loadingOff()
                })
            );
}
```

# Skip loading indicator using Http Context

```
export const SkipLoading = new HttpContextToken(
    () => false
)

const courses$ = this.http.get<GetCoursesResponse>(`${this.env.apiRoot}/courses`,
      {
         context: new HttpContext().set(SkipLoading, true)
      });
```

# Add Http Interceptor into Application Config (app.config.ts)
```
provideHttpClient(
    withFetch(),
    withInterceptors([
       loadingInterceptor
    ])
)
```

# Get and Set from Localstorage

```
localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

const json = localStorage.getItem(USER_STORAGE_KEY);
if (json) {
    const user = JSON.parse(json);
    this.#userSignal.set(user);
}
```

# Router - Navigate by URL

```
router = inject(Router);

await this.router.navigateByUrl('/login');
```

# Forms

```
<div class="login-form" [formGroup]="form">

    <h3>Login</h3>

    <div class="form-control">
      <label>Email:</label>
      <input placeholder="Enter your email"
             formControlName="email">
    </div>
    <div class="form-control">
      <label>Password:</label>
      <input type="password" placeholder="Enter your password"
             formControlName="password">
    </div>
</div>
<div class="form-actions">
    <button class="btn" routerLink="/home">Home</button>
    <button class="btn" (click)="onLogin()">
      Login
    </button>
</div>

fb = inject(FormBuilder);

form = this.fb.group({
    email: [''],
    password: ['']
});

const {email, password} = this.form.value;

```

# Authentication Guard

```
export const isUserAuthenticated: CanActivateFn = 
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if(authService.isLoggedIn()) {
        return true;
    }
    else {
        return router.parseUrl('/login');
    }
}

//app.route.ts
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [isUserAuthenticated]
  }
]

```
# Model Binding - Two way

```
// Parent component
<course-category-combobox
    label="Course category"
    [(value)]="category" />

category = signal<CourseCategory>("BEGINNER");

const courseProps = this.form.value as Partial<Course>;
courseProps.category = this.category();


//Child Component
<div class="form-control">

  <label>{{label()}}</label>

  <select [value]="value()"  #category
        (change)="onCategoryChanged(category.value)">
    <option value="BEGINNER">Beginners</option>
    <option value="INTERMEDIATE">Intermediate</option>
    <option value="ADVANCED">Advanced</option>
  </select>

</div>

value = model.required<CourseCategory>();

onCategoryChanged(category: string) {
    this.value.set(category as CourseCategory);
}

```

# Communicate between componenet using ActivatedRoute and Resolver

```
\\ Course card list Component
<button class="btn"
        [routerLink]="['courses', course.id]">
    VIEW COURSE
</button>

\\ Course component
course = signal<Course | null>(null);
lessons = signal<Lesson[]>([]);

route = inject(ActivatedRoute);

ngOnInit() {
    this.course.set(this.route.snapshot.data["course"]);
    this.lessons.set(this.route.snapshot.data["lessons"]);
}

//Course Resolver
export const courseResolver: ResolveFn<Course | null> =
    async(route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot) => {
        const courseId = route.paramMap.get("courseId");
        if (!courseId) {
            return null;
        }
        const coursesService = inject(CoursesService);
        return coursesService.getCourseById(courseId);
    }
    
//Lessons Resolver
export const courseLessonsResolver: ResolveFn<Lesson[]> =
  async (route: ActivatedRouteSnapshot,
         state: RouterStateSnapshot) => {
    const courseId = route.paramMap.get("courseId");
    if (!courseId) {
      return [];
    }
    const lessonsService = inject(LessonsService);
    return lessonsService.loadLessons({courseId});
  }

//app.route.ts
{
    path: 'courses/:courseId',
    component: CourseComponent,
    canActivate: [isUserAuthenticated],
    resolve: {
      course: courseResolver,
      lessons: courseLessonsResolver,
    }
}
```
