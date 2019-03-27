/**
 * @component  Login
 * 登录组件
 * */
import React from "react";
import { connect } from "react-redux";
import Api from "~/until/api";
import { Form, Icon, Input, Button, Row, message } from "antd";
const FormItem = Form.Item;
const usercodeRegularOrdinary = /^[a-zA-Z][a-zA-Z0-9_]{5,17}$/;/*6-18位字母或者数字或者下划线 不能以数字开头   -------->普通的用户名校验规则*/
const usercodeRegularComplex = /^[a-zA-Z](?=.*\d)[a-zA-Z0-9_]{5,17}$/;/*6-18位字母或者数字或者下划线，至少包含字母和数字   ---------->复杂的用户名校验规则*/
const pwdRegularOrdinary = /^(?=.*\d)(?=.*[a-zA-Z])[^ \t/\\\n\r]{6,18}$/;/*6-18位字母或者数字或者除去空格换行\/tab键的特殊字符，至少包含字母和数字普通的密码校验规则*/
const pwdRegularComplex1 = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){6,18}$/;/*6-18位字母或者数字或者除去空格换行\/tab键的特殊字符，至少包含大小写字母和数字普通的密码校验规则*/
const pwdRegularComplex2 = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^ \t/\\\n\r]){6,18}$/;/*6-18位字母或者数字或者除去空格换行\/tab键的特殊字符，至少包含字母和数字和特殊字符普通的密码校验规则*/
class Forget extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      imgSrc: "",
      confirmDirty: false,
      issend: true,
      seconds: 60,
      tipTxt: "点击获取验证码",
      isclo: false,
      registWay: ""
    };
    this.registType = "";
  }

  componentWillMount() {
    this.getLoginCaptcha();
  }
  componentDidMount() {
      this.setState({
          registWay: this.props.loginAllocation.pwdBackWay
      });
      const registWay = this.props.loginAllocation.pwdBackWay;
      let registWayArray = registWay.split("_");
      if (registWayArray.indexOf("account") >= 0) {
          this.registType = "用户名";
      }
      if (registWayArray.indexOf("phone") >= 0) {
          this.registType = this.registType + (this.registType?"/电话号码":"电话号码") ;
      }
      if (registWayArray.indexOf("email") >= 0) {
          this.registType = this.registType + (this.registType?"/邮箱":"邮箱");
      }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.loginAllocation !== nextProps.loginAllocation) {
        this.setState({
            registWay: nextProps.loginAllocation.pwdBackWay
        });
        const registWay = nextProps.loginAllocation.pwdBackWay;
        let registWayArray = registWay.split("_");
        if (registWayArray.indexOf("account") >= 0) {
            this.registType = "用户名";
        }
        if (registWayArray.indexOf("phone") >= 0) {
            this.registType = this.registType + (this.registType?"/电话号码":"电话号码") ;
        }
        if (registWayArray.indexOf("email") >= 0) {
            this.registType = this.registType + (this.registType?"/邮箱":"邮箱");
        }
    }
  }

  getLoginCaptcha = () => {
    Api.getLoginCaptcha().then(blob => {
      let url = URL.createObjectURL(blob);
      this.setState({
        imgSrc: url
      });
    });
  };
  //确认密码输入
  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  validateToNextPassword = (rule, value, callback) => {
      let loginRegistWay = sessionStorage.getItem("loginAllocation")?JSON.parse(sessionStorage.getItem("loginAllocation")):{}
    const form = this.props.form;
      let pwdRegular = "";
      let pwdRegular2 = "";
      let message = loginRegistWay.codeRules;
      if(loginRegistWay.passwordRegularType==2){
          pwdRegular = pwdRegularComplex1;
          pwdRegular2 = pwdRegularComplex2;

          message = message||"6-18位至少包含大小写字母和数字或者包含字母和数字和特殊字符的密码"
          // message = "密码格式不正确"
      }else{
          pwdRegular = pwdRegularOrdinary;
          pwdRegular2 = pwdRegularOrdinary;
          message = message||"6-18位至少包含字母和数字的密码"
          // message = "密码格式不正确"
      }
    let password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_~!@#$]{8,18}$/;
    if (!pwdRegular.test(value)||!pwdRegular2.test(value)) {
      callback(message);
    } else if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
      callback();
    }
  };
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;

    if (value && value !== form.getFieldValue("newPwd")) {
      callback("两次密码不一致!");
    }else if(!value){
        callback("请再次输入新密码")
      } else {
      callback();
    }
  };
  validateUsercode = (rule, value, callback) => {
      let registWayArray = this.state.registWay.split("_");
      const email = /^\w+\@\w+\.[a-z]+$/;
      const tel = /^((0\d{2,3}-\d{7,8})|(1[345789]\d{9}))$/;

      let validate = 0;
      if (registWayArray.indexOf("email") >= 0) {
          const email = /^\w+\@\w+\.[a-z]+$/;
          if (!value) {
              return callback(`请输入正确的${this.registType}`);
          } else if (!email.test(value)) {
              validate++;
          }
      }
      if (registWayArray.indexOf("phone") >= 0) {
          if (!value) {
              return callback(`请输入正确的${this.registType}`);
          } else if (!tel.test(value)) {
              validate++;
          }
      }
      if (registWayArray.indexOf("account") >= 0) {
          if (value.length<=0) {
              return  callback(`请输入正确的${this.registType}`);
          }
      }
      if (validate >= registWayArray.length) {
          callback(`请输入正确的${this.registType}`);
      } else {
          callback();
      }
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.verifyPass = true
        Api.modifyPassword1(values)
          .then(res => {
            if (res.status === "1") {
              message.success(res.message);
              
            }
          })
          .catch(err => {
            this.getLoginCaptcha();
            this.props.form.setFieldsValue({
              usercode: "",
              randomPassword: "",
              newPwd: "",
              reNewPwd: ""
            });
            message.error(err.message);
            this.setState({
              isclo: true
            });
          });
      } else {
      }
    });
  };
  turn() {
    this.props.forget(true);
    this.props.form.setFieldsValue({
      usercode: "",
      randomPassword: "",
      newPwd: "",
      reNewPwd: ""
    });
  }
  register() {
    this.props.isRegister(false);
  }
  getTelCaptcha(e) {
    e.preventDefault();
    const _this = this;
    let tel = _this.props.form.getFieldValue("usercode");
    this.setState({
      isclo: false
    });
    if (tel === undefined) {
        this.props.form.setFields({usercode: {
                value:'',
                errors:[new Error(`请输入${this.registType}`)]
            }});
    } else {
      Api.sendRandomCaptcha({ usercode: tel,type:3 })
        .then(res => {
          message.success(res.message);
          // 发送验证码成功
          // 显示60s倒计时
          const timer = setInterval(() => {
            _this.setState(
              preState => {
                return {
                  seconds: preState.seconds - 1,
                  tipTxt: `${_this.state.seconds}s后`
                };
              },
              () => {
                if (_this.state.seconds < 0 || this.state.isclo === true) {
                  clearInterval(timer);
                  _this.setState({
                    seconds: 60,
                    tipTxt: "点击获取验证码"
                  });
                }
              }
            );
          }, 1000);
        })
        .catch(res => {
            this.props.form.setFields({usercode: {
                    value:tel,
                    errors:[new Error(res.message)]
                }});
        });
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row className="login-box">
        <Row className={'login-box-title'}>密码找回</Row>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator("usercode", {
              rules: [{ validator: this.validateUsercode }]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder={`请输入${this.registType}`}
              />
            )}
          </FormItem>
          <FormItem>
            <div className='flex-cap-id'>
                <div>
                    {getFieldDecorator("randomPassword", {
                        rules: [{ required: true, message: "输入验证码" }]
                    })(
                        <Input
                            placeholder="请输入验证码"
                            prefix={
                                <Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />
                            }
                        />
                    )}
                </div>
                <div>
                    {this.state.seconds == 60 ? (
                        <Button onClick={e => this.getTelCaptcha(e)}>
                            点击获取验证码
                        </Button>
                    ) : (
                        <Button
                            style={{
                                height: "40px",
                                // background: "#484988",
                                // border: "1px solid #484988",
                                color: "#9f9ea7"
                            }}
                        >
                            {" "}
                            {this.state.tipTxt}
                        </Button>
                    )}
                </div>
            </div>
          </FormItem>
          <FormItem>
            {getFieldDecorator("newPwd", {
              rules: [
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="请输入8-18位数字加字母组合的新密码"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator("reNewPwd", {
              rules: [
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="请再次输入新密码"
                onBlur={this.handleConfirmBlur}
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              确认
            </Button>
            <Row style={{ textAlign: "right" }}>
              <a onClick={() => this.props.toLogin()}>重新登录</a>
            </Row>
          </FormItem>
        </Form>
      </Row>
    );
  }
}

const ForgetPassWord = Form.create()(Forget);

const mapStateToProps = state => {
  const { loginReducer, loginAllocation } = state;
  return { loginReducer, loginAllocation };
};
export default connect(mapStateToProps)(ForgetPassWord);
