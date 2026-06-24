# Kattour Syntax V1

## Philosophy

Kattour is designed to read like human intent.

The goal is:

- less syntax noise
- fewer symbols
- fewer nested wrappers
- maximum readability

---

# Page

```kattour
page Home
```

---

# State

```kattour
state count = 0
state username = "Elias"
```

---

# Theme

```kattour
theme {
  primary "#cb0606"
  radius 18
}
```

---

# Layout

```kattour
view {
  screen {
    column {
      text "Hello"
    }
  }
}
```

---

# Events

```kattour
button "Increase" {
  click count++
}
```

---

# Components

```kattour
component Card(title) {
  card {
    title "$title"
  }
}
```

Usage:

```kattour
Card "Welcome"
```

---

# Conditions

```kattour
if loggedIn {
  Dashboard
}
else {
  Login
}
```

---

# Loops

```kattour
for product in products {
  ProductCard product
}
```

---

# Design Direction

Kattour is not HTML.
Kattour is not JSX.
Kattour is not YAML.

Kattour is a human-first declarative UI language.
