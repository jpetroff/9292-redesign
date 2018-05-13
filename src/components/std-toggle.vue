<style lang="less"></style>

<template>
	<ul class="std-toggle">
		<li class="std-toggle__item" v-for="(item, index) in items"
			:data-value="item.value" :data-index="index" :class="(active == index) ? 'active': ''"
			@click="toggleItem($event.currentTarget.dataset)"
		>
			<span class="item-label">{{item.label}}</span>
		</li>
	</ul>
</template>

<script>
	w.Components['std-toggle'] = {
		template: '<%= template %>',
		props: ['items', 'active'],
		methods: {
			toggleItem: function(dataset) {
				GlobalState.update('timeType', parseInt(dataset.value));
				this.active = dataset.index;
			}
		}
	}
</script>