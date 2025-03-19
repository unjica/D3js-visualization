export class ContextMenu {
    private menu: HTMLElement;
    private onStateChange: (state: 'normal' | 'inverted' | 'skipped') => void;

    constructor(onStateChange: (state: 'normal' | 'inverted' | 'skipped') => void) {
        this.onStateChange = onStateChange;
        this.menu = this.createMenu();
        document.body.appendChild(this.menu);
        
        // Close menu on click outside
        document.addEventListener('click', () => this.hide());
    }

    private createMenu(): HTMLElement {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.display = 'none';

        const states = [
            { label: 'Normal', value: 'normal' },
            { label: 'Invert', value: 'inverted' },
            { label: 'Skip', value: 'skipped' }
        ];

        states.forEach(state => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = state.label;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onStateChange(state.value as 'normal' | 'inverted' | 'skipped');
                this.hide();
            });
            menu.appendChild(item);
        });

        return menu;
    }

    public show(x: number, y: number): void {
        this.menu.style.display = 'block';
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
    }

    public hide(): void {
        this.menu.style.display = 'none';
    }
} 