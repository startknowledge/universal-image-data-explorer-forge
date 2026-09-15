import { CONVERSION_GROUPS } from '../config.js';
import { INFO_DATA } from '../infoData.js';

export class MenuBuilder {
  constructor(containerId, onSelectCallback, onInfoCallback) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelectCallback;
    this.onInfo = onInfoCallback;
    this.currentActive = null;
    this.render();
  }

  render() {
    this.container.innerHTML = '<div class="conv-menu" id="dynamicMenu"></div>';
    const menuDiv = document.getElementById('dynamicMenu');
    
    CONVERSION_GROUPS.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group-item';
      groupDiv.innerHTML = `
        <div class="group-header" data-group="${group.name}">
          <span><i class="${group.icon}"></i> ${group.name}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="conv-items" data-items="${group.name}"></div>
      `;
      const itemsContainer = groupDiv.querySelector('.conv-items');
      group.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'conv-btn';
        btn.dataset.id = item.id;
        btn.innerHTML = `<i class="fas fa-cog"></i> <span class="conv-label">${item.name}</span>`;

        // Info icon
        const info = document.createElement('button');
        info.className = 'info-icon';
        info.type = 'button';
        info.setAttribute('aria-label', `Info about ${item.name}`);
        info.textContent = 'i';
        info.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.onInfo) this.onInfo(item.id);
        });
        btn.appendChild(info);

        btn.addEventListener('click', (e) => {
          if (e.target.classList.contains('info-icon')) return;
          document.querySelectorAll('.conv-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentActive = item.id;
          if (this.onSelect) this.onSelect(item.id, item.name);
        });
        itemsContainer.appendChild(btn);
      });
      
      const header = groupDiv.querySelector('.group-header');
      const itemsDiv = groupDiv.querySelector('.conv-items');
      header.addEventListener('click', () => {
        itemsDiv.classList.toggle('collapsed');
        header.classList.toggle('collapsed');
      });
      itemsDiv.classList.add('collapsed');
      header.classList.add('collapsed');
      menuDiv.appendChild(groupDiv);
    });
  }

  getActiveId() { return this.currentActive; }
}