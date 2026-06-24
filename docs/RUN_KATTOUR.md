# Run Kattour

## Create Project

```bash
kattour create my-app
```

---

## Start Dev Server

```bash
cd my-app
kattour dev app.kat
```

Open:

```text
http://localhost:5179
```

---

## Production Build

```bash
kattour build app.kat
```

Output:

```text
dist/index.html
```

---

## Features Working

- Components
- State
- Arrays
- Objects
- Loops
- Conditions
- Click Events
- Two-way Binding
- Reactive Runtime
- Hot Reload

---

## Example

```kattour
page Home

state username = "Elias"
state count = 0

view {
  screen {
    column {
      title "Hello $username"

      input {
        bind username
      }

      button "Count: $count" {
        click count++
      }
    }
  }
}
```
