import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取钱包信息
export const getWalletInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/wallet`,
    method: 'GET'
  })
}

// ========================= 银行卡 =============================

// 绑定银行卡
export const bindBankCardService = (data: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-bank-card`,
    method: 'POST',
    data
  })
}

// 获取用户的银行卡信息
export const getBankCardService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-bank-card`,
    method: 'GET'
  })
}

// 更新银行卡
export const updateBankCardService = (data: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-bank-card`,
    method: 'PUT',
    data
  })
}

// ========================= 提现 =============================

// 申请提现
export const applyWithdrawService = (data: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/withdraw/create`,
    method: 'POST',
    data
  })
}

// 获取提现记录
export const getWithdrawRecordService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/withdraw/my`,
    method: 'GET'
  })
}

// ====================== 账户明细 ============================
export const getWalletTransactionService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/wallet-transaction/my`,
    method: 'GET'
  })
}
