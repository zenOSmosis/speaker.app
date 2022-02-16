import fetch from "node-fetch";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

global.fetch = fetch;

export default async function searchMedia({
  query,
  queryEngine,
  page = 1,
  perPage = 15,
}) {
  try {
    const apiResponse = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
    });

    return apiResponse.response;
  } catch (err) {
    console.error(err);

    throw new Error(
      `An error occurred when trying to query the ${queryEngine} service`
    );
  }
}
