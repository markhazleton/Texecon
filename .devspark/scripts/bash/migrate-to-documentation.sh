#!/usr/bin/env bash
# migrate-to-documentation.sh
# Migrates DevSpark projects from old structure (.specify/, memory/, scripts/, templates/)
# to new .knowledge/ structure
#
# Usage:
#   ./migrate-to-documentation.sh           # Interactive migration
#   ./migrate-to-documentation.sh --dry-run # Preview changes without modifying files
#   ./migrate-to-documentation.sh --cleanup # Remove .old backup directories

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters for reporting
DIRS_MOVED=0
FILES_UPDATED=0
WARNINGS=0
DRY_RUN=false
CLEANUP_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --cleanup)
            CLEANUP_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Preview changes without modifying files"
            echo "  --cleanup    Remove .old backup directories after verification"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_dry_run() {
    echo -e "${CYAN}[DRY RUN]${NC} $1"
}

# Cleanup mode - remove .old directories
if [ "$CLEANUP_MODE" = true ]; then
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}Cleanup Mode: Remove Backup Directories${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""

    # Find .old directories
    OLD_DIRS=()
    [ -d ".specify.old" ] && OLD_DIRS+=(".specify.old")
    [ -d "memory.old" ] && OLD_DIRS+=("memory.old")
    [ -d "scripts.old" ] && OLD_DIRS+=("scripts.old")
    [ -d "templates.old" ] && OLD_DIRS+=("templates.old")

    if [ ${#OLD_DIRS[@]} -eq 0 ]; then
        print_info "No .old backup directories found"
        exit 0
    fi

    echo "Found backup directories:"
    for dir in "${OLD_DIRS[@]}"; do
        SIZE=$(du -sh "$dir" | cut -f1)
        echo "  - $dir ($SIZE)"
    done
    echo ""

    echo -e "${RED}WARNING: This will permanently delete these directories!${NC}"
    echo -e "${YELLOW}Make sure you have verified the migration was successful first.${NC}"
    echo ""
    echo -e "Type ${RED}DELETE${NC} to confirm deletion, or anything else to cancel:"
    read -r confirmation

    if [ "$confirmation" = "DELETE" ]; then
        for dir in "${OLD_DIRS[@]}"; do
            echo "Deleting $dir..."
            rm -rf "$dir"
            print_status "Deleted $dir"
        done
        echo ""
        print_status "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
    exit 0
fi

# Main migration mode
echo -e "${BLUE}============================================${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}DRY RUN MODE - No files will be modified${NC}"
    echo -e "${BLUE}============================================${NC}"
else
    echo -e "${BLUE}DevSpark Migration to .knowledge/${NC}"
    echo -e "${BLUE}============================================${NC}"
fi
echo ""

# Safety checks
echo -e "${BLUE}Running safety checks...${NC}"
echo ""

# Check if we're in a git repository
if [ -d ".git" ]; then
    print_status "Git repository detected"

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "You have uncommitted changes in your repository"
        echo "  It's recommended to commit or stash changes before migration"
        echo ""
        if [ "$DRY_RUN" = false ]; then
            echo "Continue anyway? (y/N): "
            read -r response
            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                print_info "Migration cancelled"
                exit 0
            fi
        fi
    else
        print_status "Working tree is clean"
    fi
else
    print_warning "Not a git repository - cannot preserve history"
fi

# Check if .knowledge already exists
if [ -d ".knowledge" ]; then
    print_warning ".knowledge/ already exists - will merge with existing content"
fi

echo ""
echo -e "${BLUE}Detecting old structure...${NC}"
echo ""

# Detect what needs to be migrated
OLD_STRUCTURES_FOUND=false
STRUCTURES_TO_MIGRATE=()

if [ -d ".specify" ]; then
    print_status "Found .specify/ directory"
    STRUCTURES_TO_MIGRATE+=(".specify")
    OLD_STRUCTURES_FOUND=true
fi

if [ -d "memory" ] && [ ! -d ".knowledge/memory" ]; then
    print_status "Found memory/ directory"
    STRUCTURES_TO_MIGRATE+=("memory")
    OLD_STRUCTURES_FOUND=true
fi

if [ -d "scripts" ] && [ ! -d ".knowledge/scripts" ]; then
    print_status "Found scripts/ directory"
    STRUCTURES_TO_MIGRATE+=("scripts")
    OLD_STRUCTURES_FOUND=true
fi

if [ -d "templates" ] && [ ! -d ".knowledge/templates" ]; then
    print_status "Found templates/ directory"
    STRUCTURES_TO_MIGRATE+=("templates")
    OLD_STRUCTURES_FOUND=true
fi

if [ -d "specs" ] && [ ! -d ".knowledge/specs" ]; then
    print_status "Found specs/ directory"
    STRUCTURES_TO_MIGRATE+=("specs")
    OLD_STRUCTURES_FOUND=true
fi

if [ "$OLD_STRUCTURES_FOUND" = false ]; then
    echo ""
    print_error "No old structure found to migrate."
    echo "Looking for: .specify/, memory/, scripts/, templates/, or specs/"
    echo ""
    exit 0
fi

echo ""
echo -e "${BLUE}Migration Plan:${NC}"
echo ""
echo "The following actions will be performed:"
echo ""
echo "  1. Create .knowledge/ directory structure"
echo "  2. Copy files from old locations to new locations:"
for struct in "${STRUCTURES_TO_MIGRATE[@]}"; do
    echo "     - $struct/ → .knowledge/"
done
echo "  3. Update path references in files:"
echo "     - Agent command files (.claude/, .github/, etc.)"
echo "     - Script files (.knowledge/scripts/)"
echo "     - Documentation files (README.md, etc.)"
echo "  4. Rename old directories with .old suffix:"
for struct in "${STRUCTURES_TO_MIGRATE[@]}"; do
    echo "     - $struct/ → $struct.old/"
done
echo "  5. Update .gitignore if needed"
echo ""
echo -e "${GREEN}Your specs/ directory will be moved to .knowledge/specs/${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}This operation will modify your repository.${NC}"
    echo -e "${YELLOW}Press Enter to continue, or Ctrl+C to cancel...${NC}"
    read
fi

echo ""
echo -e "${BLUE}Step 1: Creating .knowledge/ structure${NC}"

# Create directory structure
if [ "$DRY_RUN" = true ]; then
    print_dry_run "Would create .knowledge/memory/"
    print_dry_run "Would create .knowledge/scripts/bash/"
    print_dry_run "Would create .knowledge/scripts/powershell/"
    print_dry_run "Would create .knowledge/templates/"
else
    mkdir -p .knowledge/memory
    print_status "Created .knowledge/memory/"

    mkdir -p .knowledge/scripts/bash
    mkdir -p .knowledge/scripts/powershell
    print_status "Created .knowledge/scripts/"

    mkdir -p .knowledge/templates
    print_status "Created .knowledge/templates/"
fi

echo ""
echo -e "${BLUE}Step 2: Copying files${NC}"

# Function to move directory contents
copy_dir() {
    local source=$1
    local dest=$2
    local name=$3

    if [ -d "$source" ]; then
        local file_count
        file_count=$(find "$source" -type f | wc -l | tr -d ' ')

        if [ "$DRY_RUN" = true ]; then
            print_dry_run "Would copy $file_count files from $name to $dest/"
            print_dry_run "Would rename $source to ${source}.old"
        else
            # Copy all contents
            cp -r "$source"/* "$dest/" 2>/dev/null || true

            # Rename old directory
            mv "$source" "${source}.old"
            ((DIRS_MOVED++))
            print_status "Copied $name to $dest/ ($file_count files)"
            print_status "Renamed $source to ${source}.old"
        fi
    fi
}

# Move .specify/ if exists
if [ -d ".specify" ]; then
    if [ "$DRY_RUN" = true ]; then
        [ -d ".specify/memory" ] && print_dry_run "Would copy .specify/memory/ to .knowledge/memory/"
        [ -d ".specify/scripts" ] && print_dry_run "Would copy .specify/scripts/ to .knowledge/scripts/"
        [ -d ".specify/templates" ] && print_dry_run "Would copy .specify/templates/ to .knowledge/templates/"
        print_dry_run "Would copy .specify/ root files to .knowledge/"
        print_dry_run "Would rename .specify to .specify.old"
    else
        # .specify might contain memory, scripts, templates subdirectories
        if [ -d ".specify/memory" ]; then
            cp -r .specify/memory/* .knowledge/memory/ 2>/dev/null || true
            print_status "Copied .specify/memory/ to .knowledge/memory/"
        fi
        if [ -d ".specify/scripts" ]; then
            cp -r .specify/scripts/* .knowledge/scripts/ 2>/dev/null || true
            print_status "Copied .specify/scripts/ to .knowledge/scripts/"
        fi
        if [ -d ".specify/templates" ]; then
            cp -r .specify/templates/* .knowledge/templates/ 2>/dev/null || true
            print_status "Copied .specify/templates/ to .knowledge/templates/"
        fi
        if [ -d ".specify/specs" ]; then
            mkdir -p .knowledge/specs
            cp -r .specify/specs/* .knowledge/specs/ 2>/dev/null || true
            print_status "Copied .specify/specs/ to .knowledge/specs/"
        fi
        # Copy any other files in .specify root
        find .specify -maxdepth 1 -type f -exec cp {} .knowledge/ \; 2>/dev/null || true
        print_status "Copied .specify/ root files to .knowledge/"

        mv .specify .specify.old
        ((DIRS_MOVED++))
        print_status "Renamed .specify to .specify.old"
    fi
fi

# Copy top-level directories
copy_dir "memory" ".knowledge/memory" "memory/"
copy_dir "scripts" ".knowledge/scripts" "scripts/"
copy_dir "templates" ".knowledge/templates" "templates/"
copy_dir "specs" ".knowledge/specs" "specs/"

echo ""
echo -e "${BLUE}Step 3: Updating path references in files${NC}"

# Function to update references in a file
update_file_references() {
    local file=$1

    if [ ! -f "$file" ]; then
        return
    fi

    if [ "$DRY_RUN" = true ]; then
        # Check if file would be modified
        cp "$file" "$file.bak.tmp"
        sed -E -i.tmp \
            -e 's@(/?)\.specify/@\1.knowledge/@g' \
            -e 's@(^|[[:space:]]|`)/memory/@\1/.knowledge/memory/@g' \
            -e 's@(^|[[:space:]]|`)/scripts/@\1/.knowledge/scripts/@g' \
            -e 's@(^|[[:space:]]|`)/templates/@\1/.knowledge/templates/@g' \
            -e 's@memory/constitution\.md@.knowledge/memory/constitution.md@g' \
            "$file" 2>/dev/null || true

        if ! cmp -s "$file" "$file.bak.tmp" 2>/dev/null; then
            print_dry_run "Would update references in $file"
        fi

        # Restore original
        mv "$file.bak.tmp" "$file" 2>/dev/null || true
        rm "$file.tmp" 2>/dev/null || true
    else
        # Create backup
        cp "$file" "$file.bak"

        # Update references using sed with regex
        sed -E -i.tmp \
            -e 's@(/?)\.specify/@\1.knowledge/@g' \
            -e 's@(^|[[:space:]]|`)/memory/@\1/.knowledge/memory/@g' \
            -e 's@(^|[[:space:]]|`)/scripts/@\1/.knowledge/scripts/@g' \
            -e 's@(^|[[:space:]]|`)/templates/@\1/.knowledge/templates/@g' \
            -e 's@memory/constitution\.md@.knowledge/memory/constitution.md@g' \
            "$file"

        # Check if file changed
        if ! cmp -s "$file" "$file.bak"; then
            ((FILES_UPDATED++))
            print_status "Updated references in $file"
        fi

        # Clean up
        rm "$file.bak" "$file.tmp" 2>/dev/null || true
    fi
}

# Update agent command files
for dir in .claude .github .cursor .windsurf .gemini .qwen .opencode .codex .kilocode .augment .roo .codebuddy .qoder .amazonq .agents .shai .bob; do
    if [ -d "$dir" ]; then
        find "$dir" -type f \( -name "*.md" -o -name "*.toml" \) 2>/dev/null | while read -r file; do
            update_file_references "$file"
        done
    fi
done

# Update script files
if [ -d ".knowledge/scripts" ]; then
    find .knowledge/scripts -type f \( -name "*.sh" -o -name "*.ps1" \) 2>/dev/null | while read -r file; do
        update_file_references "$file"
    done
fi

# Update documentation files
for file in README.md .vscode/settings.json; do
    if [ -f "$file" ]; then
        update_file_references "$file"
    fi
done

# Update all markdown files in .knowledge
if [ -d ".knowledge" ]; then
    find .knowledge -maxdepth 1 -type f -name "*.md" 2>/dev/null | while read -r file; do
        update_file_references "$file"
    done
fi

echo ""
echo -e "${BLUE}Step 4: Updating .gitignore${NC}"

# Add .knowledge build output to .gitignore if needed
if [ -f ".gitignore" ]; then
    if ! grep -q ".knowledge/_site" .gitignore; then
        if [ "$DRY_RUN" = true ]; then
            print_dry_run "Would add .knowledge/_site/ to .gitignore"
        else
            echo "" >> .gitignore
            echo "# DevSpark documentation build output" >> .gitignore
            echo ".knowledge/_site/" >> .gitignore
            print_status "Added .knowledge/_site/ to .gitignore"
        fi
    else
        print_status ".gitignore already configured"
    fi
fi

echo ""
echo -e "${GREEN}============================================${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}Dry Run Complete - No Changes Made${NC}"
else
    echo -e "${GREEN}Migration Complete!${NC}"
fi
echo -e "${GREEN}============================================${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
    echo "Summary:"
    echo "  - Directories moved: $DIRS_MOVED"
    echo "  - Files updated: $FILES_UPDATED"
    echo "  - Warnings: $WARNINGS"
    echo ""
    echo "Backup directories created:"
    [ -d ".specify.old" ] && echo "  - .specify.old/"
    [ -d "memory.old" ] && echo "  - memory.old/"
    [ -d "scripts.old" ] && echo "  - scripts.old/"
    [ -d "templates.old" ] && echo "  - templates.old/"
    echo ""
fi

echo "Next steps:"
if [ "$DRY_RUN" = true ]; then
    echo "  1. Review the dry run output above"
    echo "  2. Run without --dry-run to perform the migration:"
    echo "     ${YELLOW}bash .knowledge/scripts/migrate-to-documentation.sh${NC}"
else
    echo "  1. Review changes: ${YELLOW}git status${NC} and ${YELLOW}git diff${NC}"
    echo "  2. Test slash commands in your AI assistant"
    echo "  3. Test scripts: ${YELLOW}bash .knowledge/scripts/bash/setup-plan.sh${NC}"
    echo "  4. Verify constitution loads: ${YELLOW}cat .knowledge/memory/constitution.md${NC}"
    echo "  5. If everything works, commit:"
    echo "     ${YELLOW}git add -A${NC}"
    echo "     ${YELLOW}git commit -m 'chore: migrate to .knowledge/ structure'${NC}"
    echo "  6. After verifying and committing, delete old backups:"
    echo "     ${YELLOW}bash .knowledge/scripts/migrate-to-documentation.sh --cleanup${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Do NOT delete .old directories until you've verified the migration!${NC}"
fi
echo ""

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Please review warnings above before committing${NC}"
    echo ""
fi

if [ "$DRY_RUN" = false ]; then
    print_status "Migration script completed successfully"
    echo ""
    echo -e "${CYAN}Need help? See .knowledge/upgrade.md${NC}"
fi
