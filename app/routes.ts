import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/:entry", "routes/content.tsx"),
] satisfies RouteConfig;
