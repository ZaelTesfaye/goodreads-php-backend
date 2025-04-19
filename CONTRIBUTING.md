# 📘 Team Contribution Guide

## 🧾 Branch Structure

- **main**: 🚫 Production-ready code only. **Do not commit directly here**.
- **develop**: 🌱 Integration branch for all new features. **Branch from here** to start any work.

---

## 🚀 Getting Started

### 1. **Fork the Repository**

- Go to: [https://github.com/Tesfamichael12/goodreads-php-backend](https://github.com/Tesfamichael12/goodreads-php-backend)
- Click `Fork` to create your own copy.

### 2. **Clone Your Fork**

```bash
git clone https://github.com/YOUR-USERNAME/goodreads-php-backend.git
cd goodreads-php-backend
```

### 3. To stay up-to-date

#### Method 1: **Add the Main Repository as Upstream**

```bash
git remote add upstream https://github.com/Tesfamichael12/goodreads-php-backend.git
git fetch upstream
```

#### Method 2: **Sync the Latest Updates from the Main Repository**

Before starting your work, ensure your fork is up-to-date with the main repository:

1. **Fetch Updates from Upstream**

```bash
git fetch upstream
```

2. **Merge Updates into Your Fork**

```bash
git checkout develop
git merge upstream/develop
```

3. **Push the Synced Changes to Your Fork**

```bash
git push origin develop
```

By keeping your fork updated, you avoid merge conflicts and ensure you're working with the latest code.

### 4. **Check Out the Latest `develop` Branch**

```bash
git checkout develop
git pull upstream develop
```

### 5. **Create a Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

### 6. **Make Changes, Commit, and Push**

```bash
git add .
git commit -m "feat: Description of your changes"
git push -u origin feature/your-feature-name
```

### 7. **Create a Pull Request**

- Go to your fork on GitHub.
- Open a Pull Request **from** your `feature/your-feature-name` **to** `develop` on the main repository.

---

✅ You're done!
