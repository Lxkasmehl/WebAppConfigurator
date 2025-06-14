import { test, expect } from '@playwright/test';
import { setupComponentsInPreview } from '../helpers/setupHelpers';
import { createAndVerifyGroup, editGroup } from '../helpers/groupHelpers';
import { setupAndCreateGroup } from '../helpers/setupHelpers';
import { verifyBorderColorsDifferent } from '../helpers/uiHelpers';
import {
  configureTableColumn,
  verifyTableData,
  handleTableDownload,
} from '../helpers/tableHelpers';
import { selectFromAutocomplete } from '../../../shared/helpers/autocompleteHelper';

test.describe('Group Tests', () => {
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/#/ui-builder');

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();
  });

  test('create group with chart, filterArea, buttonBar, table', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const componentTypes = ['chart', 'filterArea', 'buttonBar', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );
  });

  test('create two groups with table and buttonBar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);
  });

  test('create two groups with table and buttonBar and edit the two groups', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);

    // Edit groups
    await editGroup(page, 'Test Group 1', [0]);
    await editGroup(page, 'Test Group 2', [0, 1]);
    await editGroup(page, 'Test Group 1', [1]);

    // Verify border colors after editing
    await verifyBorderColorsDifferent(page, firstGroup, secondGroup);
  });

  test('fill chart component with actual data', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1920 });
    test.setTimeout(240000);

    const componentTypes = ['chart', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );

    await configureTableColumn(page, sortableComponents.table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
      mainEntity: true,
    });

    await configureTableColumn(page, sortableComponents.table, 1, {
      label: 'User - addressLine1',
      entity: 'User',
      property: 'addressLine1',
    });

    await configureTableColumn(page, sortableComponents.table, 2, {
      label: 'User - gender',
      entity: 'User',
      property: 'gender',
    });

    const columnHeader = sortableComponents.table
      .locator('.MuiDataGrid-columnHeader')
      .nth(3);
    await columnHeader.hover();
    const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Delete Column' });
    await editColumnMenuItem.click();

    await page.getByTestId('chart-edit-button').click();

    await selectFromAutocomplete(
      page,
      'chart-data-source-select',
      'User - gender',
      0,
      {
        useSection: false,
      },
    );

    await page.getByTestId('chart-save-button').click();

    await expect(
      sortableComponents.table.locator('.MuiDataGrid-overlay'),
    ).not.toBeVisible();

    // Verify chart has either 5 or 6 bars
    const chartBars = page.locator('.MuiBarElement-root');
    const count = await chartBars.count();

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(6);

    // Get all bars and their values
    const bars = await chartBars.all();

    // Get x-axis labels
    const xAxisLabels = await page
      .locator('.MuiChartsAxis-directionX')
      .allTextContents();

    // Split the single string into individual characters and filter out empty strings
    const labels = xAxisLabels[0]
      .split('')
      .map((label) => (label === ' ' ? '' : label))
      .filter((label, index, array) => {
        // Keep empty strings from spaces at start and end
        if (index === 0 || index === array.length - 1) return true;
        // For middle elements, only keep non-empty strings
        return label !== '';
      });

    // Expected values
    const expectedValues = {
      '': 185,
      M: [480, 493],
      F: [330, 317],
      U: 3,
      D: 1,
      O: 1,
    };

    // Verify each bar's value
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const label = labels[i] || '';
      const expectedValue = expectedValues[label];

      // Skip hovering for values less than 3
      if (expectedValue >= 3) {
        // Hover over the bar to see its value
        await bar.hover();

        // Wait for tooltip to appear and get its value
        const tooltip = page.locator('.MuiChartsTooltip-root');
        const tooltipText = await tooltip.textContent();
        const actualValue = parseInt(tooltipText.match(/\d+/)[0]);

        if (Array.isArray(expectedValue)) {
          expect(expectedValue).toContain(actualValue);
        } else {
          expect(actualValue).toBe(expectedValue);
        }
      }
    }
  });

  test('create group with filterArea, buttonBar, table and fill everything with proper data and functionality', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(180000);

    const componentTypes = ['filterArea', 'buttonBar', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );

    await configureTableColumn(page, sortableComponents.table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
      mainEntity: true,
    });

    await configureTableColumn(page, sortableComponents.table, 1, {
      label: 'User - addressLine1',
      entity: 'User',
      property: 'addressLine1',
    });

    await configureTableColumn(page, sortableComponents.table, 2, {
      label: 'User - gender',
      entity: 'User',
      property: 'gender',
    });

    const columnHeader = sortableComponents.table
      .locator('.MuiDataGrid-columnHeader')
      .nth(3);
    await columnHeader.hover();
    const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Delete Column' });
    await editColumnMenuItem.click();

    await sortableComponents.filterArea
      .getByTestId('DeleteIcon')
      .last()
      .click({ force: true });

    await sortableComponents.filterArea
      .getByTestId('EditIcon')
      .first()
      .click({ force: true });
    await selectFromAutocomplete(
      page,
      'filter-column-select',
      'User - UserId',
      0,
      {
        useSection: false,
      },
    );

    await sortableComponents.filterArea
      .getByTestId('EditIcon')
      .first()
      .click({ force: true });
    await selectFromAutocomplete(
      page,
      'filter-column-select',
      'User - addressLine1',
      0,
      {
        useSection: false,
      },
    );

    await sortableComponents.filterArea
      .getByTestId('EditIcon')
      .nth(1)
      .click({ force: true });
    await selectFromAutocomplete(
      page,
      'filter-column-select',
      'User - gender',
      0,
      {
        useSection: false,
      },
    );

    await sortableComponents.buttonBar.getByTestId('EditIcon').first().click();

    await page
      .locator('.MuiModalDialog-root')
      .getByTestId('DeleteIcon')
      .nth(2)
      .click({ force: true });
    await page
      .locator('.MuiModalDialog-root')
      .getByTestId('DeleteIcon')
      .nth(2)
      .click({ force: true });

    await page
      .locator('.MuiModalDialog-root')
      .getByTestId('AddIcon')
      .nth(5)
      .click({ force: true });
    await page
      .locator('.MuiModalDialog-root')
      .getByTestId('AddIcon')
      .nth(6)
      .click({ force: true });
    await page
      .locator('.MuiModalDialog-root')
      .getByTestId('AddIcon')
      .nth(6)
      .click({ force: true });

    await page.getByTestId('button-bar-save-button').click();

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    await selectFromAutocomplete(
      page,
      'filter-option-select-User - gender',
      'M',
      0,
      {
        useSection: false,
      },
    );

    await page.getByTestId('apply-filter-button').click();

    await verifyTableData(
      page,
      sortableComponents.table,
      [
        /^(162|kkkkCHE)$/,
        /^(Zürichbergstr. 7| |)$/,
        'M',
        /^(10033376|kkkkCHE)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        'M',
        /^(10033376|ttttLMS2|ttttrec1|wwwwCHE)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        'M',
        /^(wwwwCHE|qqqq|tttt_TAL|wwwwDEU)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        'M',
        /^(wwwwDEU|qqqqCHE|ttttatoss|wwwwDEU2)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        'M',
        /^(wwwwDEU2|qqqqDEU|wwwwCHE|wwwwLMS)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        'M',
        /^(wwwwDEU2|wwwwLMS|qqqqDEU2|wwwwDEU|wwwwLMS2)$/,
        'Landsberger Str. 110',
        'M',
      ],
      testInfo,
    );

    await page.getByTestId('clear-filter-button').click();

    await verifyTableData(
      page,
      sortableComponents.table,
      [
        '6c701150-dff5-4762-bc7f-8c8e78ab729f',
        '',
        '',
        /^(162|kkkkCHE)$/,
        /^(Zürichbergstr. 7| |)$/,
        'M',
        /^(llllCHE|kkkkCHE)$/,
        'Zürichbergstr. 7',
        /^(M|F)$/,
        /^(llllCHE|10033376)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        /^(M|F)$/,
        /^(ttttLMS2|10033376|ttttrec1|wwwwCHE)$/,
        'Landsberger Str. 110',
        /^(M|F)$/,
        /^(ttttqui|pppprec1|ttttrec1|ttttUSA|ttttrec2)$/,
        /^(645 Dolcetto Drive|Landsberger Str. 110)$/,
        'F',
        /^(ttttrec1|pppprec2|ttttrec2|tttt_TAL)$/,
        /^(Zürichbergstr. 7|Landsberger Str. 110)$/,
        /^(M|F)$/,
      ],
      testInfo,
    );

    await page.getByTestId('column-selector-button').click();
    await page
      .getByTestId('column-selector-checkbox-User - addressLine1')
      .click({ force: true });
    await page.getByTestId('column-selector-apply-button').click();

    await verifyTableData(page, sortableComponents.table, [
      '6c701150-dff5-4762-bc7f-8c8e78ab729f',
      '',
      /^(162|kkkkCHE)$/,
      'M',
      'kkkkCHE',
      'M',
      'llllCHE',
      'F',
      '10033376',
      'M',
      /^(ttttqui|ttttrec1)$/,
      'F',
      /^(ttttrec1|ttttrec2)$/,
      'F',
    ]);

    // Test downloading with all columns
    await handleTableDownload(page, 'All columns');

    // Test downloading with only visible columns
    await handleTableDownload(page, 'Only visible columns');

    await page.getByTestId('sort-button').click();

    await selectFromAutocomplete(
      page,
      'sort-column-select',
      'User - UserId',
      0,
      {
        useSection: false,
      },
    );

    await page.getByTestId('sort-desc-radio').click();
    await page.getByTestId('sort-apply-button').click();

    await verifyTableData(page, sortableComponents.table, [
      'zzzztal2',
      'M',
      'zzzztal1',
      'M',
      'zzzzrec3',
      'M',
      'zzzzrec2',
      'M',
      'zzzzrec1',
      'M',
      'zzzzqui',
      'M',
      'zzzzdev',
      'M',
    ]);
  });
});
