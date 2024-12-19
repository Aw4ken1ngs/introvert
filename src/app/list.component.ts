
 import { Component, HostListener, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { openDB, IDBPDatabase } from 'idb';


 type FunnelType = {
   id: string;
   title: string;
  isCheck: boolean;
   steps: StepType[];
   isExpanded?: boolean;
 };

 type StepType = {
   id: string;
   title: string;
   isCheck: boolean;
   type: string;
 };

 @Component({
   selector: 'list',
   standalone: true,
  imports: [CommonModule],
   templateUrl: './list.component.html',
 })
 export class List implements OnInit {
   isDropdownOpen = false;
   db!: IDBPDatabase;

   funnels: FunnelType[] = [
     {
       id: '1',
       title: 'Продажи',
      isCheck: false,
       isExpanded: false,
       steps: [
         { id: '1.1', title: 'Неразобранное', isCheck: false, type: 'no-started' },
        { id: '1.2', title: 'Переговоры', isCheck: false, type: 'in-progress' },
         { id: '1.3', title: 'Принимают решение', isCheck: false, type: 'decision' },
         { id: '1.4', title: 'Успешно', isCheck: false, type: 'success' },
       ],
     },
     {
       id: '2',
       title: 'Сотрудники',
       isCheck: false,
       isExpanded: false,
       steps: [
         { id: '2.1', title: 'Неразобранное', isCheck: false, type: 'no-started' },
         { id: '2.2', title: 'Переговоры', isCheck: false, type: 'in-progress' },
         { id: '2.3', title: 'Принимают решение', isCheck: false, type: 'decision' },
         { id: '2.4', title: 'Успешно', isCheck: false, type: 'success' },
       ],
     },
     {
       id: '3',
       title: 'Партнеры',
       isCheck: false,
       isExpanded: false,
       steps: [
         { id: '3.1', title: 'Неразобранное', isCheck: false, type: 'no-started' },
         { id: '3.2', title: 'Переговоры', isCheck: false, type: 'in-progress' },
         { id: '3.3', title: 'Принимают решение', isCheck: false, type: 'decision' },
         { id: '3.4', title: 'Успешно', isCheck: false, type: 'success' },
       ],
     },
     {
       id: '4',
       title: 'Ивент',
     isCheck: false,
       isExpanded: false,
       steps: [
         { id: '4.1', title: 'Неразобранное', isCheck: false, type: 'no-started' },
         { id: '4.2', title: 'Переговоры', isCheck: false, type: 'in-progress' },
         { id: '4.3', title: 'Принимают решение', isCheck: false, type: 'decision' },
         { id: '4.4', title: 'Успешно', isCheck: false, type: 'success' },
       ],
     },
     {
       id: '5',
      title: 'Входящие сообщения',
       isCheck: false,
       isExpanded: false,
       steps: [
         { id: '5.1', title: 'Неразобранное', isCheck: false, type: 'no-started' },
         { id: '5.2', title: 'Переговоры', isCheck: false, type: 'in-progress' },
         { id: '5.3', title: 'Принимают решение', isCheck: false, type: 'decision' },
         { id: '5.4', title: 'Успешно', isCheck: false, type: 'success' },
       ],
     },
   ];

   async ngOnInit() {
     await this.initializeDB();
     await this.loadState();
   }

   async initializeDB() {
     this.db = await openDB('ChecklistDB', 1, {
       upgrade(db) {
         if (!db.objectStoreNames.contains('funnels')) {
           db.createObjectStore('funnels', { keyPath: 'id' });
         }
       },
     });
   }

   async saveState() {
     const transaction = this.db.transaction('funnels', 'readwrite');
    const store = transaction.objectStore('funnels');
     for (const funnel of this.funnels) {
       await store.put(funnel);
     }
     await transaction.done;
   }

   async loadState() {
     const transaction = this.db.transaction('funnels', 'readonly');
     const store = transaction.objectStore('funnels');
     const savedFunnels: FunnelType[] = [];

     for await (const cursor of store.iterate()) {
       savedFunnels.push(cursor.value);
     }

     if (savedFunnels.length > 0) {
       this.funnels = savedFunnels;
    }
   }

   toggleDropdown() {
     if (!this.isDropdownOpen) {
       this.isDropdownOpen = true;
     } else {
       if (this.areAnySelected()) {
         this.toggleAllSelection(false);
       } else {
         this.toggleAllSelection(true);
       }
     }
     this.saveState();
   }

   closeDropdown() {
     this.isDropdownOpen = false;
     this.funnels.forEach((funnel) => (funnel.isExpanded = false));
   }

   toggleExpand(funnel: FunnelType, event: MouseEvent) {
     event.stopPropagation();
     funnel.isExpanded = !funnel.isExpanded;
     this.saveState();
   }

   toggleCheck(item: { isCheck: boolean }) {
     item.isCheck = !item.isCheck;
     this.saveState();
   }

   toggleAllSelection(forceSelect: boolean) {
    this.funnels.forEach((funnel) => {
       funnel.isCheck = forceSelect;
       funnel.steps.forEach((step) => (step.isCheck = forceSelect));
     });
     this.saveState();
   }

   areAnySelected(): boolean {
     return (
         this.funnels.some((funnel) => funnel.isCheck) ||
        this.funnels.some((funnel) => funnel.steps.some((step) => step.isCheck))
     );
   }

   getButtonLabel(): string {
     if (this.isDropdownOpen) {
       return this.areAnySelected() ? 'Снять выделение' : 'Выбрать все';
     } else {
       const selectedFunnels = this.funnels.filter((funnel) => funnel.isCheck).length;
       const selectedSteps = this.funnels.reduce(
          (acc, funnel) => acc + funnel.steps.filter((step) => step.isCheck).length,
           0
       );
       return `${selectedFunnels} воронки, ${selectedSteps} этапов`;
     }
   }

   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent) {
     this.closeDropdown();
   }
 }