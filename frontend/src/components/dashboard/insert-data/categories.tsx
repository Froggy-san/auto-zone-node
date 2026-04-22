import CategoryManagement from "./category-management";
import CategoryList from "./category-section";

const Categories = () => {
  // const { data, error } = await getAllCategoriesAction();

  // if (error) return <ErrorMessage>{error}</ErrorMessage>;
  return (
    <section className=" space-y-2">
      {/* <CategroyForm /> */}
      <CategoryManagement />

      <CategoryList />

      {/* <CategoriesManagement /> */}
    </section>
  );
};

export default Categories;
