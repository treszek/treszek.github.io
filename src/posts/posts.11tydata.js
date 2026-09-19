export default {
  layout: "layouts/post.njk",
  tags: ["post"],
  eleventyComputed: {
    board: (data) => data.board || data.page.filePathStem.split("/")[2],
    permalink: (data) =>
      `/${data.board || data.page.filePathStem.split("/")[2]}/${data.page.fileSlug}/`,
  },
};
