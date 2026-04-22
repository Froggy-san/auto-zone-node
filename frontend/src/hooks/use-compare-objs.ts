import { useState, useEffect, useCallback } from "react";
import _ from "lodash";

// Define a generic type for the hook that can be used for any object type.
type ObjectCompareHook<T> = (obj1: T, obj2: T) => boolean;

const useObjectCompare: ObjectCompareHook<any> = (obj1, obj2) => {
  const [isEqual, setIsEqual] = useState(false);

  // useCallback ensures that the same function is returned each render if the inputs haven't changed.
  const compareObjects = useCallback(() => {
    // Use lodash's isEqual method to compare the objects.
    setIsEqual(_.isEqual(obj1, obj2));
  }, [obj1, obj2]);

  // Call the compare function whenever an object changes.
  useEffect(() => {
    compareObjects();
  }, [compareObjects]);

  return isEqual;
};

export default useObjectCompare;
