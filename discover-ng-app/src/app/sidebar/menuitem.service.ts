import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuitemService {
  leftMenuItems: MenuItem[] = [
    {label: 'Run', icon: 'assets/ic_24px_run.svg', selectedIcon: 'assets/ic_24px_run_selected.svg'},
    {label: 'Explore', icon: 'assets/ic_24px_explore.svg', selectedIcon: 'assets/ic_24px_explore_selected.svg'}
  ];

  rightMenuItems: MenuItem[] = [
    {label: 'Designs', icon: 'assets/ic_24px_designs.svg', selectedIcon: 'assets/ic_24px_designs_selected.svg'}
  ];
}

export interface MenuItem {
  label: string
  icon: string
  selectedIcon: string
}
