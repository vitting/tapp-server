import {config} from "./src/config/config";
import {MongooseConnect} from "./src/config/mongoose-config";
import {Chance} from "chance";
import {EmployeeModel} from "./src/models/employeeModel";
import {Employee, ICustomer, IEmployee, ITask} from "./src/interfaces";
import {CustomerModel} from "./src/models/customerModel";
import {TaskModel} from "./src/models/taskModel";

if (process.env.NODE_ENV === "development") {
    MongooseConnect.connect(config.mongoDbUrlDev);
}

type empType = {
  id: string;
  username: string;
  password: string;
};

type custType = {
    id: string;
    name: string;
};

let empArray: empType[] = [];
let custArray: custType[] = [];

let c = new Chance();
createEmployees();

function createEmployees() {
    // EMPLOYEES
    const password = "password123";
    let empPromises = [];

    let testEmp = new Employee(
        "test@testmail.com",
        password,
        c.first(),
        c.last(),
        {
            street: c.street(),
            city: c.city(),
            zipCode: c.integer({min: 3000, max: 9000})
        },
        c.integer({min: 20000000, max: 90000000}).toString(),
        "test@testmail.com",
        true
    );

    empPromises.push(EmployeeModel.createEmployee(testEmp));

    for (let i = 0; i < 10; i++) {
        let email = c.email();

        let e = new Employee(
            email,
            password,
            c.first(),
            c.last(),
            {
                street: c.street(),
                city: c.city(),
                zipCode: c.integer({min: 3000, max: 9000})
            },
            c.integer({min: 20000000, max: 90000000}).toString(),
            email,
            c.bool()
        );

        empPromises.push(EmployeeModel.createEmployee(e));
    }

    Promise.all(empPromises).then((values: IEmployee[]) => {
        for (let emp of values) {
            empArray.push({id: emp._id, username: emp.username, password});
        }

        createCustomers();
    });
}

function createCustomers() {
    // CUSTOMERS
    let custPromises = [];
    for (let i = 0; i < 10; i++) {
        let cust: ICustomer = {
            firstName: c.first(),
            lastName: c.last(),
            address: {
                street: c.street(),
                city: c.city(),
                zipCode: c.integer({min: 3000, max: 9000})
            },
            mail: c.email(),
            mobilePhone: c.integer({min: 20000000, max: 90000000}).toString()
        };

        custPromises.push(CustomerModel.createCustomer(cust));
    }

    Promise.all(custPromises).then((customers: ICustomer[]) => {
        for (let cust of customers) {
            custArray.push({id: cust._id, name: cust.firstName + " " + cust.lastName});
        }

        createTasks();
    });
}

function createTasks() {
    //TASKS
    let taskPromises = [];
    for (let i = 0; i < 10; i++) {
        let year = new Date(Date.now()).getFullYear();
        let month = new Date(Date.now()).getMonth();
        let day = c.integer({min: 1, max: 28});
        let startHour = c.integer({min: 8, max: 14});
        let endHour = c.integer({min: startHour + 1, max: startHour + 5});
        let startDate = new Date(year, month, day, startHour, 0, 0, 0);
        let endDate = new Date(year, month, day, endHour, 0, 0, 0);
        let customer = custArray[c.integer({min: 0, max: custArray.length - 1})].id;
        let employees: string[] = [];

        for (let emp of empArray) {
            if (c.bool()) {
                employees.push(emp.id);
            }
        }

        let t: ITask = {
            customer: customer,
            description: c.paragraph(),
            address: {
                street: c.street(),
                city: c.city(),
                zipCode: c.integer({min: 3000, max: 9000})
            },
            employeesAssigned: employees,
            startDate: startDate,
            endDate: endDate
        };

        taskPromises.push(TaskModel.createTask(t));
    }

    Promise.all(taskPromises).then((tasks) => {
        for (let emp of empArray) {
            console.log(`Username: ${emp.username} | Password: ${emp.password}`);
        }
    });
}
