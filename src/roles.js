const config = require("../config.json");

const BUTTON_STYLES = new Set(["Primary", "Secondary", "Success", "Danger"]);

function panels() {
  return config.panels || [];
}

function findPanelByChannel(channelId) {
  return panels().find((panel) => panel.channelId === channelId);
}

function exclusiveRoles(panel) {
  return (panel.exclusiveRoles || []).filter((role) => role.id && !String(role.id).startsWith("ROLE_ID"));
}

function findGroupByRoleId(roleId) {
  for (const panel of panels()) {
    const role = exclusiveRoles(panel).find((item) => item.id === roleId);
    if (role) {
      return { panel, role };
    }
  }
  return null;
}

function buttonStyle(style) {
  return BUTTON_STYLES.has(style) ? style : "Secondary";
}

module.exports = {
  config,
  panels,
  findPanelByChannel,
  exclusiveRoles,
  findGroupByRoleId,
  buttonStyle,
};
