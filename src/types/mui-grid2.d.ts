declare module "@mui/material/Grid2" {
    import * as React from "react";
    import { GridProps } from "@mui/material";
  
    const Grid2: React.FC<GridProps & {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      item?: boolean;
      container?: boolean;
      spacing?: number;
    }>;
  
    export default Grid2;
  }
  