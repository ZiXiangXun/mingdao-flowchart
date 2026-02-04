// 明道云API基础配置（替换成你的AppKey、AppSecret）
const MINGDAO_CONFIG = {
  appKey: "a0d4aa1144e6941d",
  appSecret: "NTRkMWI0OTNiNjVkNDNlYjE2NjRkOGFmMWY2ZDU5MDNmZDViM2ViMWU5YmZkNWQzODc2MWZhNjcxZWMzY2JmMw=="
};

// 1. 获取明道云API Token
export async function getMingdaoToken() {
  const res = await fetch("http://120.26.103.83:8880/open/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: MINGDAO_CONFIG.appKey,
      client_secret: MINGDAO_CONFIG.appSecret
    })
  });
  const data = await res.json();
  return data.access_token;
}

// 2. 拉取指定记录的详情（比如销售订单详情）
export async function getRecordDetail(token, appId, formId, recordId) {
  const res = await fetch(
    `http://120.26.103.83:8880/open/v2/apps/${appId}/forms/${formId}/records/${recordId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}

// 3. 拉取“关联当前记录的其他单据”（比如销售订单关联的生产订单）
export async function getRelatedRecords(token, appId, targetFormId, linkField, sourceRecordId) {
  // linkField是“关联字段的标识”（比如生产订单里“关联销售订单”的字段标识）
  const filter = `${linkField} eq '${sourceRecordId}'`;
  const res = await fetch(
    `http://120.26.103.83:8880/open/v2/apps/${appId}/forms/${targetFormId}/records?filter=${encodeURIComponent(filter)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}
