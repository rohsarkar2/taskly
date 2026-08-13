/**
 * react-native-svg-transformer turns `.svg` imports into React components at
 * bundle time. Without this declaration TypeScript treats them as untyped
 * modules and the import fails to compile.
 */
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";

  const content: React.FC<SvgProps>;
  export default content;
}
