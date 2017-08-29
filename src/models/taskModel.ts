import * as mongoose from "mongoose";
import {ICalendarEvent, IStartAndEndDate, ITask} from "../interfaces";
import Utilities from "../utilities";
import * as moment from "moment";
import StartOf = moment.unitOfTime.StartOf;

let Schema = mongoose.Schema;
const taskSchema: mongoose.Schema = new Schema({
    "customer": {
        "type": Schema.Types.ObjectId,
        "required": true,
        "ref": "Customer"
    },
    "startDate": {
        "type": Date,
        "required": true,
        "default": Date.now
    },
    "endDate": {
        "type": Date,
        "required": true,
        "default": Date.now
    },
    "address": {
        "street": {
            "type": String,
            "required": true
        },
        "zipCode": {
            "type": Number,
            "required": true
        },
        "city": {
            "type": String,
            "required": true
        }
    },
    "description": {
        "type": String,
        "required": true
    },
    "employeesAssigned": [{
        "type": Schema.Types.ObjectId,
        "ref": "Employee"
    }]
});

type ITaskDocument = ITask & mongoose.Document;
const TaskM: mongoose.Model<ITaskDocument> = mongoose.model<ITaskDocument>("Task", taskSchema);

export class TaskModel {
    private static populateOptions = [
        {path: "customer"},
        {path: "employeesAssigned", select: "-password"}
    ];

    private static updateReturnsNew = {"new": true};

    static createTask(task: ITask) {
        return TaskM.create(task);
    }

    static deleteTask(id: string) {
        return TaskM.findByIdAndRemove(id).exec();
    }

    static updateTask(task: ITask) {

    }

    static getTask(id: string) {
        const query = {_id: id};

        return TaskM.findOne(query).populate(this.populateOptions).exec();
    }

    static getTasksByDate(date: string, type: StartOf) {
        const dates: IStartAndEndDate = Utilities.getStartAndEndDate(date, type);
        const query = {
            startDate: {
                $gt: dates.startDate,
                $lt: dates.endDate
            }
        };

        if (type === "day") {
            return TaskM.find(query).populate(this.populateOptions).exec();
        } else if (type === "month") {
            return new Promise((resolve, reject) => {
                TaskM.find(query).exec((err, res) => {
                    if (err) reject(err);

                    resolve(this.convertToCalendarEvents(res));
                });
            });
        }
    }

    private static convertToCalendarEvents(tasks: ITask[]): ICalendarEvent[] {
        let calendarEvents: ICalendarEvent[] = [];
        tasks.forEach((task: ITask) => {
            calendarEvents.push({
                start: task.startDate,
                title: "",
                color: {
                    primary: "#fff",
                    secondary: "#fff"
                }
            });
        });
        return calendarEvents;
    }

    static getTasks() {
        return TaskM.find({}).populate(this.populateOptions).exec();
    }

    static addEmployeeToTask(taskId: string, userId: string) {
        const update = {
            $addToSet: {
                employeesAssigned: userId
            }
        };

        return TaskM.findByIdAndUpdate(taskId, update, this.updateReturnsNew).exec();
    }
}