// This file contains the singleton class and a static method to access it.
// It is a reusable module that can be imported by any server-side code.

// Define the class for your singleton object.
type AccToDelete = {
  deleteDate: string;
  picture: string | null;
  setTimeoutFn: number;
};

class MySingleton {
  // We declare a static property to hold the single instance.
  private static instance: MySingleton;
  private count: number;
  public accsToBeDeleted = new Map<string, AccToDelete>();

  public createEntery(id: string, acc: AccToDelete) {
    this.accsToBeDeleted.set(id, acc);
  }

  public deleteEntry(id: string) {
    const item = this.accsToBeDeleted.get(id);
    const cleanUp = clearTimeout(item?.setTimeoutFn);
    this.accsToBeDeleted.delete(id);
  }

  // A private constructor prevents direct instantiation with `new MySingleton()`.
  private constructor() {
    this.count = 0;
    console.log("MySingleton instance created.");
  }

  // This static method is the public entry point to get the singleton.
  // It checks if an instance already exists and creates one if not.
  public static getInstance(): MySingleton {
    if (!MySingleton.instance) {
      MySingleton.instance = new MySingleton();
    }
    return MySingleton.instance;
  }

  // A method to demonstrate that we are always using the same instance.
  public increment() {
    this.count++;
    return this.count;
  }
}

// We can export the class directly, or a function that gets the instance.
// Exporting the class is more common with this pattern.
export { MySingleton };

// To use it in another file, you would import it like this:
// import { MySingleton } from '../../lib/singleton';
// const singleton = MySingleton.getInstance();
