import { expect } from '@playwright/test';
import { dragAndVerifyComponent } from './componentHelpers';
import { selectFromAutocomplete } from '../../../shared/helpers/autocompleteHelper';
import { setupFlowConnection } from '../../datapicker/helpers/flowSetup';
import fs from 'fs';

// Helper function to edit a cell
export async function editCell(table, rowIndex, columnIndex, value) {
  // Get all cells in the specified row
  const rowCells = table.locator(
    `.MuiDataGrid-row:nth-child(${rowIndex + 1}) .MuiDataGrid-cell`,
  );
  // Get the specific cell in the column
  const cell = rowCells.nth(columnIndex);
  await cell.dblclick();

  // Wait for the edit input to appear and fill it with test data
  const editInput = table.locator('input[type="text"]');
  await editInput.waitFor({ state: 'visible' });
  await editInput.fill(value);
  await editInput.press('Enter');

  // Verify the cell contains the entered data
  await expect(cell).toContainText(value);
}

// Helper function to setup table and verify its visibility
export async function setupTable(page, previewArea) {
  const sortableTableComponent = await dragAndVerifyComponent(
    page.getByTestId('draggable-component-table'),
    previewArea,
    'table',
  );

  const table = sortableTableComponent.locator('.MuiDataGrid-root');
  await expect(table).toBeVisible();
  return { sortableTableComponent, table };
}

// Helper function to verify table data
export async function verifyTableData(page, table, expectedValues, testInfo) {
  // Take a screenshot before verification only if testInfo is provided
  if (testInfo) {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }

  // Wait for at least one cell to be visible
  await table
    .locator('.MuiDataGrid-cell')
    .first()
    .waitFor({ state: 'visible' });

  // Wait until we have at least expectedValues.length cells
  await table
    .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
    .nth(expectedValues.length - 1)
    .waitFor({ state: 'visible' });

  // Get all non-empty cells
  const cells = await table
    .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
    .all();

  for (let i = 0; i < expectedValues.length; i++) {
    const cellText = await cells[i].textContent();
    // Normalize empty strings and single spaces to be considered equal
    const normalizedCellText = cellText.trim() === '' ? '' : cellText;

    if (expectedValues[i] instanceof RegExp) {
      expect(normalizedCellText).toMatch(expectedValues[i]);
    } else {
      const normalizedExpectedValue =
        expectedValues[i].trim() === '' ? '' : expectedValues[i];
      expect(normalizedCellText).toBe(normalizedExpectedValue);
    }
  }
}

/**
 * Helper function to configure a table column
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {import('@playwright/test').Locator} table - The table locator
 * @param {number} columnIndex - The index of the column to configure
 * @param {Object} config - Configuration object
 * @param {string} config.label - The column label
 * @param {string} config.entity - The entity name
 * @param {string} config.property - The property name
 * @param {boolean} [config.useDataPicker=false] - Whether to use data picker
 */
export async function configureTableColumn(
  page,
  table,
  columnIndex,
  {
    label,
    entity,
    property,
    useDataPicker = false,
    mainEntity = false,
    relationship = null,
  },
  testInfo,
) {
  const columnHeader = table
    .locator('.MuiDataGrid-columnHeader')
    .nth(columnIndex);
  await columnHeader.hover();
  const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
  await menuButton.click();
  const editColumnMenuItem = page
    .locator('li[role="menuitem"]')
    .filter({ hasText: 'Edit Column' });
  await editColumnMenuItem.click();

  await expect(page.locator('.MuiModalDialog-root')).toBeVisible();

  if (useDataPicker) {
    await page.getByTestId('data-picker-switch').click();
    const iFrame = page.getByTestId('data-picker-iframe');
    await expect(iFrame).toBeVisible();

    const frameLocator = page.frameLocator(
      '[data-testid="data-picker-iframe"]',
    );
    await setupFlowConnection(frameLocator, true);
    await selectFromAutocomplete(frameLocator, 'entity-autocomplete', entity);
    await selectFromAutocomplete(frameLocator, 'property-selector', property);
  } else {
    await selectFromAutocomplete(page, 'entity-select', entity, 0, {
      useSection: false,
    });
    await selectFromAutocomplete(page, 'property-select', property, 0, {
      useSection: false,
    });
  }

  await page.getByTestId('column-label-input').locator('input').fill(label);
  if (mainEntity) {
    await page.getByTestId('main-entity-checkbox').click();
  } else if (relationship) {
    await selectFromAutocomplete(page, 'relationship-select', relationship, 0, {
      useSection: false,
    });
  }
  await page.getByTestId('save-button').click();

  if (testInfo) {
    await page.waitForTimeout(10000);
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }

  if (useDataPicker) {
    await expect(page.getByTestId('edit-modal')).not.toBeVisible({
      timeout: 30000,
    });
  }
  await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();
}

/**
 * Helper function to handle table downloads
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} downloadOption - The download option to select ('All columns' or 'Only visible columns')
 * @param {string} [downloadDir='./test-downloads'] - Directory to save the downloaded file
 * @returns {Promise<{suggestedFilename: string, fileSize: number}>} - Information about the downloaded file
 */
export async function handleTableDownload(
  page,
  downloadOption,
  downloadDir = './test-downloads',
) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId(`menu-item-${downloadOption}`).click();

  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toMatch(/\.xlsx$/);

  // Save the file to the specified location
  const savePath = `${downloadDir}/${suggestedFilename}`;
  await download.saveAs(savePath);

  // Clean up the temporary file and saved file
  await download.delete();
  await fs.promises.unlink(savePath);

  return { suggestedFilename };
}
