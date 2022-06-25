/**
 * Format traits from checkbox-formatted object to be acceptable in a query string
 * traits param would be in the format of
 *   {
 *     Category:
 *       {Trait: bool, Trait2: bool}
 *     Category2:
 *       {Trait: bool, Trait2: bool}
 *   }
 *
 * and would output a format of
 *   {
 *     Category: [Trait1, Trait2]
 *     Category2: [Trait1, Trait2]
 *   }
 *
 * where only traits with a value of true are included
 *
 * @param traits
 * @returns {{[p: string]: string[]}}
 */
export const formatCheckboxTraits = (traits) => {
  return Object.keys(traits)
    .map((traitCategoryName) => {
      const traitCategory = traits[traitCategoryName];

      const traitCategoryKeys = Object.keys(traitCategory);

      const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

      return truthyFilters.length === 0 ? {} : {[traitCategoryName]: truthyFilters};
    })
    .reduce((prev, curr) => ({...prev, ...curr}), {});
}


export const pushQueryString = (router, query) => {
  router.push({
      pathname: router.pathname,
      query: query
    }, undefined, { shallow: true }
  );
}