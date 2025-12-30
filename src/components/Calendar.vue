<template>
    <div class="calendar-container">
        <el-calendar ref="calendar">
            <template #header="{ date }" >
                <span>{{ date }}</span>
                <el-button-group>
                    <el-button size="small" @click="selectDate('prev-month')">
                        上个月
                    </el-button>
                    <el-button size="small" @click="selectDate('today')">今日</el-button>
                    <el-button size="small" @click="selectDate('next-month')">
                        下个月
                    </el-button>
                </el-button-group>
            </template>
        </el-calendar>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import type { CalendarDateType, CalendarInstance } from 'element-plus'

const calendar = ref<CalendarInstance>()
const selectDate = (val: CalendarDateType) => {
    if (!calendar.value) return
    calendar.value.selectDate(val)
}
</script>

<style scoped>
.calendar-container {
    width: 100%;
    /* max-width: 800px; */
    /* margin: 0 auto; */
    /* padding: 20px; */
    background-color: var(--bg-primary);
    border-radius: var(--border-radius-md);
    /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
    transition: all var(--transition-normal);
    
}

:deep(.el-calendar) {
    background-color: transparent;
    color: var(--text-primary);
}

/* 日历头部 */
:deep(.el-calendar__header) {
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    padding: 15px;
    border-bottom: 1px solid var(--border-color);
}

/* 日历标题 */
:deep(.el-calendar__title) {
    color: var(--text-primary);
    font-weight: 600;
}

/* 日历导航按钮 */
:deep(.el-calendar__button) {
    color: var(--text-primary);
    background-color: transparent;
    border: none;
    padding: 5px;
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-normal);
}

:deep(.el-calendar__button:hover) {
    background-color: var(--bg-hover);
    color: var(--primary-color);
}

/* 日历主体 */
:deep(.el-calendar__body) {
    background-color: var(--bg-secondary);
    border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
    padding: 15px;
}

/* 星期标题 */
:deep(.el-calendar-table__header th) {
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
    padding: 10px 0;
}

/* 日期单元格 */
:deep(.el-calendar-table__row td) {
    border-color: var(--border-color);
    height: 180px;
}

:deep(.el-calendar-table__cell) {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
    transition: all var(--transition-normal);
    border-radius: var(--border-radius-sm);
    margin: 2px;
}

:deep(.el-calendar-table__cell:hover) {
    background-color: var(--bg-hover);
}

/* 当前日期 */
:deep(.el-calendar-table__cell.is-today) {
    color: var(--primary-color);
    font-weight: 600;
}

/* 选中日期 */
:deep(.el-calendar-table__cell.is-selected) {
    background-color: var(--primary-color) !important;
    color: white !important;
}

/* 其他月份日期 */
:deep(.el-calendar-table__cell.is-disabled) {
    color: var(--text-muted);
}

/* 周末日期 */
:deep(.el-calendar-table__row td:nth-child(6),
    .el-calendar-table__row td:nth-child(7)) {
    color: var(--text-secondary);
}
:deep(.el-calendar-day){
    height: 100%;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .calendar-container {
    max-width: 100%;
    padding: 10px;
    border-radius: 0;
    box-shadow: none;
  }
  
  /* 日历头部 */
  :deep(.el-calendar__header) {
    padding: 10px;
    border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  }
  
  /* 日历主体 */
  :deep(.el-calendar__body) {
    padding: 10px;
    border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
  }
  
  /* 星期标题 */
  :deep(.el-calendar-table__header th) {
    padding: 8px 0;
    font-size: 14px;
  }
  
  /* 日期单元格 */
  :deep(.el-calendar-table__row td) {
    height: 80px;
  }
  
  /* 日期文本 */
  :deep(.el-calendar-day) {
    font-size: 14px;
  }
  
  /* 自定义头部按钮 */
  :deep(.el-button) {
    font-size: 12px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  /* 日期单元格 */
  :deep(.el-calendar-table__row td) {
    height: 60px;
  }
  
  /* 日期文本 */
  :deep(.el-calendar-day) {
    font-size: 12px;
  }
  
  /* 自定义头部按钮 */
  :deep(.el-button) {
    font-size: 11px;
    padding: 3px 6px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .calendar-container {
    max-width: 90%;
    padding: 15px;
  }
  
  /* 日期单元格 */
  :deep(.el-calendar-table__row td) {
    height: 120px;
  }
}
</style>