export const playgroundExamples = {
  hello: `screen Home {
  column {
    text "Welcome to Kattour"
    button "Start"
  }
}`,
  login: `screen Login {
  column {
    text "Welcome Back"
    input "Email"
    input "Password"
    button "Sign In"
  }
}`,
  dashboard: `screen Dashboard {
  column {
    text "Kattour Dashboard"
    row {
      card {
        text "Users"
        text "1,240"
      }
      card {
        text "Revenue"
        text "$8,430"
      }
    }
    button "Refresh"
  }
}`
} as const;

export type PlaygroundExampleName = keyof typeof playgroundExamples;
