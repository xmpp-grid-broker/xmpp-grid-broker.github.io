import {Component, OnInit} from '@angular/core';

import {ConfigService, ErrorToString, NotificationService, PersistedItem, Topic} from '../../../core';
import {IteratorListPager} from '../../../shared';
import {CurrentTopicDetailService} from '../../current-topic-detail.service';
import {PersistedItemsService} from '../persisted-items.service';

@Component({
  selector: 'xgb-persisted-items',
  templateUrl: './persisted-items.component.html',
  styleUrls: ['./persisted-items.component.css']
})
export class PersistedItemsComponent implements OnInit {

  // Map used to keep track which items are "un-collapsed"
  toggleMap: { [key: number]: boolean; } = {};

  persistedItemsPager: IteratorListPager<PersistedItem>;

  topic: undefined | Topic;

  constructor(private detailsService: CurrentTopicDetailService,
              private service: PersistedItemsService,
              private notificationService: NotificationService,
              configService: ConfigService) {
    this.persistedItemsPager = new IteratorListPager<PersistedItem>(configService.getConfig().pageSize);
  }

  ngOnInit() {
    this.topic = this.detailsService.currentTopic();
    this.persistedItemsPager.useIterator(this.service.persistedItems(this.topic.title));
  }

  async itemClicked(item: PersistedItem) {
    this.toggleMap[item.id] = !this.toggleMap[item.id];

    try {
      await this.service.loadPersistedItemContent(this.topic.title, item);
    } catch (err) {
      // Hide the code block and show an error
      this.toggleMap[item.id] = false;
      this.setError(err);
    }
  }

  async purgeItems() {
    const confirmation = await this.notificationService.confirm(
      'Warning',
      `You are about to permanently delete all persisted items from ${this.topic.title}! Are you sure to proceed?`,
      `Yes, permanently delete ALL items`, 'Cancel');
    if (!confirmation) {
      return;
    }
    await this.executeAndRefreshIterator(this.service.purgePersistedItem(this.topic.title));
  }


  async removeItem(item: PersistedItem) {

    const confirmation = await this.notificationService.confirm(
      'Warning',
      `You are about to permanently delete the item ${item.id} from the topic ${this.topic.title}! Are you sure to proceed?`,
      `Yes, permanently delete this item`, 'Cancel');
    if (!confirmation) {
      return;
    }

    await this.executeAndRefreshIterator(this.service.deletePersistedItem(this.topic.title, item));
  }

  private setError(err) {
    this.persistedItemsPager.hasError = true;
    this.persistedItemsPager.errorMessage = ErrorToString(err);
  }

  private async executeAndRefreshIterator(promise: Promise<void>) {
    try {
      await promise;
      this.persistedItemsPager.useIterator(this.service.persistedItems(this.topic.title));
    } catch (err) {
      this.persistedItemsPager.useIterator(this.service.persistedItems(this.topic.title))
        .then(() => this.setError(err))
        .catch(() => this.setError(err));
    }
  }
}
