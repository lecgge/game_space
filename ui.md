# Game Space - UI Design Specification

## 🎯 App Overview

**Game Space** is a premium desktop application for managing local PC game libraries. Clean, powerful interface inspired by Apple Music and Vercel dashboards.

---

## 🎨 Design Token System

### Color Palette
```css
/* Backgrounds */
bg-deepest: #0a0c15    /* Main app background */
bg-deep: #0d1221       /* Card backgrounds */
bg-medium: #151932     /* Section backgrounds */
bg-light: #1f254a      /* Hover states */

/* Accents */
primary: #6366f1       /* Indigo - primary action */
primary-hover: #4f46e5 /* Darker indigo */
success: #10b981       /* Emerald - success states */
warning: #f59e0b       /* Amber - warnings */
error: #ef4444         /* Red - errors */

/* Text */
text-white: #ffffff    /* Primary text */
text-gray: #94a3b8     /* Secondary text */
text-muted: #64748b    /* Muted states */
```

### Typography
```css
font-display: "Outfit", system-ui, sans-serif
font-body: "JetBrains Mono", monospace
font-mono: "JetBrains Mono", monospace
font-primary: "Satoshi", Inter, sans-serif
```

### Spacing & Layout
- **Container Max:** `1440px` (desktop), `auto` for full-height sections
- **Gutter:** `24px` between columns
- **Card Padding:** `24px`
- **Section Margin:** `32px vertical`, `24px horizontal`
- **Border Radius:** `12px` cards, `8px` buttons

---

## 🏗️ Component Architecture

### Core Layout
```jsx
<App>                                    /* Main App Component */
├── <Navbar />                           /* Top navigation + search * 
├── <Sidebar>                            /* Left navigation menu */
├── <MainContent>                        /* Dynamic route content */
|   ├── <LibraryView />                  /* Games library grid */
|   ├── <DetailPanel />                  /* Game details sidebar */
|   └── <ImportQueue />                  /* Drag-and-drop area */
└── <Footer />                           /* Quick stats */
```

---

## 📄 Screen Specifications

### 1. Login Screen (`/login`)
**Purpose:** Initial app entry for authentication or new installations

```jsx
<LoginScreen>
  {/* Left: Branding & Hero */}
  <div class="relative h-full flex items-center justify-center">
    <HeroSection>
      <Logo class="mb-8" />
      <h1 class="text-6xl font-bold tracking-tight text-white">
        Game Space
      </h1>
      <p class="text-xl text-gray-400 mt-6 max-w-md">
        Your complete PC game library management solution. 
        Discover, organize, and optimize your gaming collection.
      </p>
    </HeroSection>
  </div>

  {/* Right: Login Form */}
  <LoginCard class="w-full max-w-lg bg-bg-deep border border-bg-medium">
    <!-- Email Input -->
    <!-- Password Input -->
    <!-- Social Login Buttons -->
    <!-- Forgot Password Link -->
  </LoginCard>
</LoginScreen>
```

**UI States:**
- **Initial:** Gradient background animation in background
- **Input Active:** Border highlight on focus with subtle ring
- **Success:** Green checkmark after login complete
- **Error:** Shaking animation + red border on invalid input

---

### 2. Home Dashboard (`/`)
**Purpose:** Main overview showing game statistics, recent activity, and quick actions

```jsx
<Dashboard>
  {/* Header Section */}
  <HeaderBar>
    <div class="flex items-center justify-between gap-6">
      <h1 class="text-4xl tracking-tight">Dashboard</h1>
      
      {/* Quick Actions Row */}
      <QuickActionsRow>
        <ActionButton @click="exportLibrary" icon="FileExport">
          Export
        </ActionButton>
        <ActionButton @click="importGames" icon="Upload">
          Import
        </ActionButton>
      </QuickActionsRow>
    </div>
  </HeaderBar>

  {/* Quick Stats (Bento Grid Layout) */}
  <StatsGrid staggerChildren={0.1}>
    
    <!-- Total Games Card -->
    <StatCard title="Total Games" value={stats.totalGames}>
      <TrendIndicator trend={stats.change24h} />
      <ProgressBar progress={stats.completionRate} color="primary" />
    </StatCard>

    <!-- Storage Usage Card -->
    <StorageCard>
      <div class="flex items-end gap-6">
        <LargeNumber>{stats.storageUsed}</LargeNumber>
        <BarChartContainer>
          <UsageBarChart 
            data={storageHistory}
            color="indigo"
          />
        </BarChartContainer>
      </div>
    </StorageCard>

    <!-- Library Health Card -->
    <HealthCard icon="Activity" color="emerald">
      <div class="flex items-center gap-4">
        <span class="text-white font-semibold">{stats.healthScore}%</span>
        <HealthIndicator score={stats.healthScore} />
      </div>
      <HealthProgressBar health={stats.healthScore} />
    </HealthCard>

    <!-- Active Licenses Card (Wide) -->
    <LicensesCard>
      <QuickFilters inline={{ enabled: true }} />
      
      <LicenseList staggerChildren={0.05}>
        {licenses.map((license, idx) => (
          <LicenseRow key={idx} license={license} />
        ))}
      </LicenseList>
    </LicensesCard>

  </StatsGrid>

  {/* Recent Activity Timeline */}
  <ActivityTimeline>
    <SectionHeader title="Recent Activity" icon="Clock" />
    <TimelineList staggerChildren={0.08}>
      {activities.map(act => (
        <TimeEntry key={act.id} entry={act} />
      ))}
    </TimelineList>
  </ActivityTimeline>
</Dashboard>
```

---

### 3. Library View (`/library`) ✨ **Primary Focus**
**Purpose:** Browse all games with advanced filtering and drag interactions

```jsx
<LibraryView>
  {/* Top Bar */}
  <Toolbar class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div class="flex items-center gap-6">
      <Breadcrumbs />
      
      <SearchBar placeholder="Search games..." icon="Search" />
      
      <FilterDropdown activeFilter={currentFilter} />
    </div>

    <ActionButtons group={{ enabled: true }}>
      <ActionButton size="lg" primary variant="primary">
        Upload Games
      </ActionButton>
    </ActionButtons>
  </Toolbar>

  {/* Main Content Grid */}
  <div class="flex items-stretch gap-6 p-4 overflow-hidden">
    
    {/* Left: Library List & Quick Filters (30%) */}
    <section class="flex flex-col gap-6 w-1/4 min-w-[320px] max-w-[360px]">
      
      {/* Quick Filters Section */}
      <FiltersGroup title="Categories" icon="Tag">
        {categories.map(cat => (
          <FilterChip 
            key={cat.id} 
            label={cat.label} 
            count={cat.count}
            selected={currentFilter === cat.id}
            onClick={() => selectFilter({type: 'category', value: cat.id})}
          />
        ))}
      </FiltersGroup>

      {/* Platform Filters */}
      <QuickPlatformRow staggerChildren={0.06}>
        {platforms.map(plat => (
          <PlatformChip key={plat.id} platform={plat} selected={currentFilter === plat.id} />
        ))}
      </QuickPlatformRow>

      {/* Game Count Summary */}
      <GameCountCard totalGames={stats.totalGames} visible={filterVisibleCount} />

    </section>

    {/* Middle: Games Grid (70%) */}
    <div class="flex-1 min-w-0">
      <div class="mb-6 flex items-center gap-4 px-4">
        <span class="text-white font-medium text-lg">
          {visibleCount}/{totalGames} games
        </span>
        <PillsGroup showAllToggle={{ enabled: true, count: totalGames }} />

      </div>
      
      {/* Game Cards with Horizontal Scroll */}
      <div class="flex overflow-x-auto gap-6 px-4 pb-4 scrollbar-hide">
        {gameCards.map((card) => (
          <GameCard 
            key={card.id} 
            game={card} 
            size={{type: 'md'}}
          />
        ))}
      </div>
    </div>

  </div>
</LibraryView>
```

**Features:**
- **Drag-to-Play:** Drag game card to launch or move to Import Queue on right
- **Card Interactions:** Hover → spotlight border, slight lift, play button reveal
- **Filter Chips:** Animated selection with smooth transitions
- **Horizontal Scroll:** Snap scrolling between game categories
- **Quick Actions Row:** Export/Import buttons accessible top-right

---

### 4. Game Detail Sidebar (`DetailPanel`)
**Purpose:** Comprehensive view of game metadata, installation status, and actions ✨

```jsx
<GameDetailSidebar>
  {/* Header: Game Art & Actions */}
  <DetailHeader class="relative">
    
    <!-- Background Image -->
    <div class="relative h-64 overflow-hidden rounded-t-xl">
      <CoverImage src={game.coverUrl} className="object-cover w-full h-full" />

      {/* Gradient Overlay - fade bottom to transparent */}
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-deep via-bg-deep/80 to-transparent" />
    </div>

    <!-- Floating Action Toolbar -->
    <ActionToolbar position="top-right" class="bg-bg-medium/95 backdrop-blur">
      <Button size="sm" variant="iconOnly" icon="Play" 
        onClick={() => launchGame(game.id)}
      >
        Launch
      </Button>
      
      <Button size="sm" variant="secondary" variant="ghost" icon="CopyUrl">
        Copy URL
      </Button>
      
      <Button size="sm" variant="iconOnly" icon="More">
        Menu (⋮)
      </Button>
    </ActionToolbar>

  </DetailHeader>

  {/* Game Information */}
  <div class="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
    
    <!-- Basic Info -->
    <BasicInfoSection>
      <TitleAndRating title={game.title} rating={game.rating} reviews={game.reviews} />
      
      <div class="flex items-center gap-6 mt-4 text-base text-gray-400">
        <MetaItem icon="Calendar">Released {game.releaseDate}</MetaItem>
        <MetaItem icon="Gamepad">Platform {game.platform}</MetaItem>
        <MetaItem icon="HardDrive">
          Storage {formatMB(game.storage, 'GB')}
        </MetaItem>
      </div>

    </BasicInfoSection>

    <!-- Tags Section -->
    <TagsSection tags={game.tags} staggerChildren={0.04} />

    {/* Installation Status (Wide Card) */}
    <InstallStatusCard gamePath={game.gamePath}>
      
      <ProgressBar progress={75} label={`${Math.floor(75)}% Complete`} />
      <div class="flex items-center justify-between mt-4">
        <span class="text-gray-400 text-sm">{downloadedMB} / {gameFileSize} MB</span>

        {/* Progress Bar */}
        <Button variant="secondary" size="sm" icon="Download">
          Continue Download
        </Button>
      </div>

    </InstallStatusCard>

  </div>

  {/* Footer Actions (Sticky) */}
  <FooterActions>
    <Button variant="primary" class="w-full" size="lg">
      Install Game ✨
    </Button>
    
    <GroupedButtons variants={['secondary', 'ghost']} staggerChildren={0.05}>
      <ActionButton icon="CloudUpload" label="Move to Cloud">
        {game.isInCloud && <CheckBadge />}
      </ActionButton>
      
      <ActionButton icon="Download" label="Download Again">
        {!game.isInstalled && <CheckBadge />}
      </ActionButton>

      <ActionButton icon="FolderOpen" label="Open Folder">
        {isPathOpen(game.path) && <ExternalLinkIcon />}
      </ActionButton>
      
      <ActionButton 
        variant="secondary" 
        icon="MoreVertical" 
        label="More Actions">
        <DropdownMenu actions={[...] } />
      </ActionButton>
    </GroupedButtons>
  </FooterActions>
</GameDetailSidebar>
```

---

### 5. Import Queue (`/queue`)
**Purpose:** Upload and organize games from file system ✨ **NEW**

```jsx
<ImportQueueScreen>
  
  {/* Drag & Drop Zone */}
  <DropZoneSection 
    icon="UploadCloud"
    label="Drag game folders here or click to browse"
    hint="Supports multiple games, instant scan"
    onFileSelect={handleFilesSelected}
  >
    
    <BrowseButton @click="openFolderDialog">
      Browse Files
    </BrowseButton>

  </DropZoneSection>

  {/* Currently Processing */}
  <ActiveUploadsList staggerChildren={0.1}>
    {processingGames.map((game) => (
      <GameUploadCard key={game.id} game={game} />
    ))}
  </ActiveUploadsList>

  {/* Upcoming Upload Queue */}
  <UploadQueueSection title="Waiting in Queue" icon="Clock">
    
    <div class="flex items-center justify-between text-xl tracking-tight mb-4">
      <span>{queueCount} games</span>
      <span class="text-gray-400">{totalPendingMB} MB total</span>
    </div>

    <!-- Queue List -->
    <QueueList staggerChildren={0.08}>
      {queueItems.map((item, idx) => (
        <QueueItem key={`${item.gameId}-${idx}`} item={item} />
      ))}
    </QueueList>
  </UploadQueueSection>

</ImportQueueScreen>
```

---

### 6. Import Status Modal (`/modal`) ✨ **NEW**
**Purpose:** Real-time upload & scanning progress with visual feedback

```jsx
<ImportStatusModal isOpen={isUploading} onClose={closeModal}>
  
  <ModalHeader className="flex flex-col items-center text-center p-12 space-y-6">
    
    {/* Animated Progress Circle */}
    <div class="relative w-40 h-40">
      <CircularProgress 
        progress={uploadProgress} 
        strokeWidth={8} 
        color="accent-primary"
        size="large" />
      
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-3xl font-bold text-white">{Math.round(loadingProgress)}%</span>
      </div>

      {/* Animated Scan Effect */}
      <ScanAnimOverlay show={isScanning} />
    </div>

    <header>
      <h2 class="text-3xl tracking-tight">
        {isUploading ? 'Importing' : 'Analyzing'}
      </h2>
      <p class="text-lg text-gray-400 mt-1">{currentGameTitle}</p>
    </header>

  </ModalHeader>

  {/* Progress Details */}
  <ProgressBar 
    progress={loadingProgress * (isUploading ? 1 : 0.7)} 
    type="thin"
  />

  {/* Files Information */}
  <FilesInfoSection filesProcessed count={filesProcessedCount} total={totalFiles}>
    
    <div class="flex items-center gap-4">
      <LargeText>{progressMB}</LargeText>
      <small class="text-gray-500 mb-2">/ {totalMB}</small>

    </div>
  </FilesInfoSection>

</ImportStatusModal>
```

---

## 🎬 Motion Specifications

### Microinteractions (Applied Globally)
```javascript
// Button Press - All Buttons
spring: { stiffness: 400, damping: 17 }
transition: { duration: 0.16 }

// Card Hover - Library Cards
hover: { 
  y: -3,
  scale: 1.02,
  rotate: [0, 0, 1],
  type: 'spring',
  stiffness: 400,
  damping: 35
}

// Spotlight Effect on Detail Images
hover: { 
  rotate: [-2, 0, 90],
  scale: 1.1,
  borderRadius: '[40px]',
  transition: { duration: 0.3 }
}

// Tab Selection - Library Tabs
selected: { width: '100%' },
hovered: { width: '95%' }
```

### Page Load Animations (Stagger Entry)
```javascript
// Dashboard Stats Cards
staggerChildren: 0.08, delay: 0, variants={fadeUp(0.6)}

// Library Game Cards
staggerChildren: 0.12, delay: 0, variants={slideInRight(0.4)}

// Detail Panel Sections
staggerChildren: 0.12, delay: 0, variants={fadeInUp()}
```

### Perpetual Motion (Background Activity)
- **Circular Progress Ring:** Rotates counter-clockwise with `repeat: Infinity`
- **Scan Animation Overlay:** Moves across screen for visual feedback
- **Floating Action Button:** Gentle hover lift (spring animation)
- **Status Indicators:** Breathing effect (opacity pulse)

---

## 📱 Responsive Behavior

### Desktop (>1280px)
- Library: Multi-column grid with full sidebar + detail view
- Stats: 3-row x 4-column bento grid
- All panels visible simultaneously

### Tablet (768px - 1280px)
- Library: 2-column game grid, collapsible filters
- Detail panel: Slide-in on right or overlay
- Stats: 2x3 grid layout

### Mobile (<768px) ✨
- **Single Column Layout:** All sections stack vertically
- **Tab-based Navigation:** Library/Settings/Profile tabs at top
- **Collapsible Sidebar:** Drawer slides in from left
- **Stagger Delays Increased:** Account for slower scroll on touch devices
- **Touch Targets:** Min `48px` height for all buttons, chips, and cards
- **Import Mode:** Full-screen drag&drop overlay

---

## 🔥 Special Effects Implementation

### 1. Drag to Import (Library Cards)
```javascript
// When dragging a game card
onDragStart: { scale: 0.95, opacity: 0.8 }        // Source shrinks
onDropAreaEnter: { scale: 0.95, y: -15 }          // Preview enters top
onDropLeave: { scale: 1, y: 0 }                   // Back to normal
```

### 2. Spotlight Card (Detail Image)
```javascript
/* Image scales & rotates on hover */
hover: { 
  rotate: [-2, 0, 90],
  scale: 1.1,
  borderRadius: '[50px]',
  transition: { duration: 0.3 }
}

/* Floating toolbar slides right */
hover: { x: 80, scale: 1, y: -20 }
```

### 3. Upload Progress Animation
```javascript
{/* Circular progress ring rotates infinitely */}
animate={{ rotate: ['-45deg', '465deg'] }, repeat: Infinity}, duration: 7, ease: "linear"

{/* Animated scan overlay moves across screen */}
animate={{ 
  x: ['0%', '200%'], 
  opacity: [1, 0] 
}}, duration: 1.5, repeat: Infinity
```

### 4. Breathing Status (Active Uploads)
```javascript
breath: { scale: [1, 1.05], opacity: [1, 0.7] },
duration: 2, repeat: Infinity, ease: "easeInOut"
```

---

## 🎯 Interactive Behavior Details

### Filter Chips (Quick Platform/Category)
```javascript
// Initial State
initial: { scale: 1 }

// Active (Selected)
active: { 
  scale: 1.2,
  y: -5,
  background: 'accent-color',
  text: '#ffffff'
},
transition: { type: "spring", damping: 17, stiffness: 500 }
```

### Upload Card Progress Bar
```javascript
// Smooth height animation
layoutId="progressBar",
animate={value},
style={{ 
  height: `${value}%`,
  transition: { duration: 0.24 },
}}
```

### Status Dot Breathing (Small Indicators)
```javascript
initial={{ scale: 1, opacity: [1, 0.7] }}
animate={
  {
    scale: [1, 0.8],
    opacity: [1, 0.5]
  }
},
transition: { repeat: Infinity, duration: 2 }
```

### Drag & Drop Feedback (Queue Item)
```javascript
// On hover by user mouse
onMouseEnter={scale:1.05, y:-3}
// On drop success
initial={{ scale: 1, rotateY: [90, 0] }}
animate={{ scale: [1], rotateY: [0, 90] }}, 
duration: 0.4, ease: "easeInOutOut"

/* Then snap to correct position */
y: [-30, -25]
```

---

## 🧩 Component List (Full Stack)

### Layout & Navigation
- **Navbar.jsx** - Top navigation with search + user menu
- **Sidebar.jsx** - Quick filters + library tabs
- **Footer.jsx** - App stats + status indicators
- **Layout.jsx** - Main grid container (desktop vs mobile responsive)

### Core Features
- **LibraryView.jsx** - Grid view + drag-to-import zone
- **GameCard.jsx** - Individual game card with actions
- **ImportQueueScreen.jsx** - Upload queue management  
- **DetailPanel.jsx** - Game sidebar with upload progress

### UI Components
- **StatCards/CardGrid/BentoLayout** - Dashboard metrics
- **QuickActionsRow** - Export/Import buttons
- **FiltersGroup** - Category/filter chip containers
- **ProgressBars/Card** - Upload/installation status bars
- **CircularProgressBar.jsx** - Ring progress animation
- **ScanAnimOverlay.jsx** - Animated scanning effect overlay

---

## ✅ Checklist Before Implementation

- [ ] `index.html` sets up Tailwind CDN (development) or PostCSS build
- [ ] `src/preload.js` exposes IPC to renderer via `window.electronAPI`  
- [ ] `src/main.js` is main process entry point, not `electron/main.js`
- [ ] All motion specs implemented with `framer-motion` (staggerChildren)
- [ ] Responsive layouts for mobile with single-column fallback
- [ ] Drag-to-import feedback animations
- [ ] Breathing status indicators in upload queue  
- [ ] Upload progress ring + scan effect overlays

---

## 📦 Tech Stack Summary

```json
{
  "frontend": {
    "framework": "React 18",
    "router": "react-router-dom @6.28.0", 
    "state": "zustand @5.0.1",
    "motion": "framer-motion @11.11.17",
    "icons": "@phosphor-icons/react | @radix-ui/react-icons"
  },
  "styling": {
    "css": "Tailwind CSS v3 (v4 compatible)",
    "animations": "Framer Motion spring physics"
  },
  "desktop": {
    "electron": "^42.3.3",
    "builder": "^26.15.0",
    "integration": "vite-plugin-electron @1.0.4"
  }
}
```

---

**END OF UI SPECIFICATION**
