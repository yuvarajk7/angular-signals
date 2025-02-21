import {inject, Injectable} from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";
import {Course} from "../models/course.model";
import {GetCoursesResponse} from "../models/get-courses.response";
import { SkipLoading } from "../loading/skip-loading.component";


@Injectable({
  providedIn: "root"
})
export class CoursesService {

  env = environment;

  http = inject(HttpClient);

  async loadAllCourses(): Promise<Course[]> {
    const courses$ = this.http.get<GetCoursesResponse>(`${this.env.apiRoot}/courses`) 
      // {
      //   context: new HttpContext().set(SkipLoading, true)
      // });
    const payload = await firstValueFrom(courses$);
    return payload.courses;
  }

  async getCourseById(courseId:string): Promise<Course> {
    const course$ =
        this.http.get<Course>(
          `${this.env.apiRoot}/courses/${courseId}`);
    return firstValueFrom(course$)
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const course$ = this.http.post<Course>(`${this.env.apiRoot}/courses`, course);
    return await firstValueFrom(course$);
  }

  async saveCourse(courseId: string, 
                    changes: Partial<Course>): Promise<Course> {
    const course$ = this.http.put<Course>(`${this.env.apiRoot}/courses/${courseId}`, changes);
    return await firstValueFrom(course$);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const delete$ = this.http.delete<void>(`${this.env.apiRoot}/courses/${courseId}`);
    return await firstValueFrom(delete$);
  }

}
